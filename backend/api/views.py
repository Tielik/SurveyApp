from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from .models import Survey, Question, Choice
from .serializers import SurveySerializer, QuestionSerializer, ChoiceSerializer, UserSerializer, \
    ChangePasswordSerializer
from django.contrib.auth.models import User
from django.conf import settings
import json
import urllib.parse
import urllib.request


def verify_recaptcha_token(token, remoteip=None):
    if not token:
        return False, "Brak tokenu reCAPTCHA."

    secret = getattr(settings, "RECAPTCHA_SECRET_KEY", "")
    if not secret or secret == "RECAPTCHA_SECRET_PLACEHOLDER":
        return False, "Brak konfiguracji reCAPTCHA."

    payload = {
        "secret": secret,
        "response": token,
    }
    if remoteip:
        payload["remoteip"] = remoteip

    data = urllib.parse.urlencode(payload).encode()
    try:
        with urllib.request.urlopen(
            "https://www.google.com/recaptcha/api/siteverify",
            data=data,
            timeout=5,
        ) as response:
            result = json.loads(response.read().decode())
    except Exception:
        return False, "Nie udalo sie zweryfikowac reCAPTCHA."

    if not result.get("success"):
        return False, "Nieprawidlowa reCAPTCHA."

    return True, None


class RecaptchaAuthToken(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        ok, error = verify_recaptcha_token(
            request.data.get("recaptcha_token"),
            request.META.get("REMOTE_ADDR"),
        )
        if not ok:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)


class SurveyViewSet(viewsets.ModelViewSet):
    serializer_class = SurveySerializer
    # Wymagamy, aby użytkownik był zalogowany
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Zwracamy tylko ankiety, których właścicielem jest zalogowany użytkownik
        return Survey.objects.filter(owner=self.request.user)

    # Nadpisujemy tworzenie ankiety
    def perform_create(self, serializer):
        # Automatycznie przypisujemy zalogowanego użytkownika jako właściciela
        serializer.save(owner=self.request.user)
        # Nadpisujemy domyślną metodę usuwania

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data.pop("recaptcha_token", None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    def destroy(self, request, *args, **kwargs):
        # Pobieramy ankietę, którą użytkownik chce usunąć
        survey = self.get_object()
        #  LOGIKA BIZNESOWA: Zabezpieczenie
        # Np. Nie pozwól usunąć ankiety, która jest publicznie dostępna (is_active=True)
        if survey.is_active:
            return Response(
                {"error": "Nie można usunąć aktywnej ankiety! Najpierw zmień jej status na szkic ."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # 3. Jeśli warunki są spełnione -> Usuwamy
        # Dzięki on_delete=models.CASCADE w models.py, to usunie też Pytania i Opcje.
        self.perform_destroy(survey)
        # 4. Zwracamy status 204 (No Content) - standard przy usuwaniu
        return Response(status=status.HTTP_204_NO_CONTENT)

    # --- Specjalna akcja dla publicznego dostępu (Głosowanie) ---
    # Dostępna pod: /api/surveys/vote_access/?code=UUID
    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def vote_access(self, request):
        code = request.query_params.get('code')
        try:
            # Szukamy ankiety po kodzie UUID
            survey = Survey.objects.get(access_code=code, is_active=True)
            # Używamy serializera, żeby zwrócić dane
            serializer = SurveySerializer(survey)
            return Response(serializer.data)
        except Survey.DoesNotExist:
            return Response({"error": "Ankieta nie istnieje lub jest nieaktywna"}, status=404)

    @action(detail=True, methods=['POST'], permission_classes=[permissions.AllowAny])
    def submit_votes(self, request, pk=None):
        try:
            survey = Survey.objects.get(pk=pk, is_active=True)
        except Survey.DoesNotExist:
            return Response({"error": "Ankieta nie istnieje lub jest nieaktywna"}, status=404)

        ok, error = verify_recaptcha_token(
            request.data.get("recaptcha_token"),
            request.META.get("REMOTE_ADDR"),
        )
        if not ok:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        answers = request.data.get('answers')
        if not isinstance(answers, list):
            return Response({"error": "Brak listy odpowiedzi."}, status=status.HTTP_400_BAD_REQUEST)

        question_ids = list(survey.question_set.values_list('id', flat=True))
        question_id_set = set(question_ids)
        submitted_answers = {}

        for answer in answers:
            if not isinstance(answer, dict):
                continue
            question_id = answer.get('question_id')
            choice_id = answer.get('choice_id')
            if question_id is None or choice_id is None:
                continue
            submitted_answers[question_id] = choice_id

        extra_questions = [qid for qid in submitted_answers.keys() if qid not in question_id_set]
        if extra_questions:
            return Response(
                {"error": "Niepoprawne pytania.", "invalid_questions": extra_questions},
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing_questions = [qid for qid in question_ids if qid not in submitted_answers]
        if missing_questions:
            return Response(
                {"error": "Brak odpowiedzi na wszystkie pytania.", "missing_questions": missing_questions},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = []
        for question_id in question_ids:
            choice_id = submitted_answers[question_id]
            try:
                choice = Choice.objects.select_related('question').get(
                    id=choice_id,
                    question_id=question_id,
                )
            except Choice.DoesNotExist:
                return Response(
                    {"error": "Niepoprawna odpowiedz.", "question_id": question_id, "choice_id": choice_id},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if choice.question.survey_id != survey.id:
                return Response(
                    {"error": "Niepoprawna odpowiedz.", "question_id": question_id, "choice_id": choice_id},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            choice.votes += 1
            choice.save()
            updated.append({"choice_id": choice.id, "votes": choice.votes})

        return Response({"status": "Odpowiedzi zapisane", "updated": updated})


# Widok do głosowania (zwiększanie licznika)
class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer

    # Pozwalamy każdemu (AllowAny) wysłać głos, ale edycja zablokowana
    def get_permissions(self):
        if self.action == 'vote':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['POST'])
    def vote(self, request, pk=None):
        choice = self.get_object()
        choice.votes += 1
        choice.save()
        return Response({'status': 'Głos dodany', 'votes': choice.votes})


# QuestionViewSet (tylko dla zalogowanych)
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Każdy może się zarejestrować
    http_method_names = ['post']  # Pozwalamy tylko na POST (tworzenie)


    def create(self, request, *args, **kwargs):
        ok, error = verify_recaptcha_token(
            request.data.get("recaptcha_token"),
            request.META.get("REMOTE_ADDR"),
        )
        if not ok:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data.pop("recaptcha_token", None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    # GET /api/profile/me/
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        # PUT/PATCH - edycja danych (username, avatar, background)
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @me.mapping.delete
    def delete_my_account(self, request):
        # Proste usunięcie - CASCADE w modelu zajmie się resztą
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    # Tworzymy akcję "change_password" dostępną pod /api/password/change_password/
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Sprawdzenie starego hasła
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response(
                    {"old_password": ["Błędne aktualne hasło."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # set_password zajmuje się haszowaniem nowego hasła
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response(
                {"detail": "Hasło zostało pomyślnie zmienione."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.models import Profile
from django.core.mail import send_mail
from django.conf import settings
import uuid
# from api.models import Rating
# Zakomentowane bo błąd wywala



@api_view(['GET'])
def verify_email(request, token):
    """
    Widok do weryfikacji maila.
    Pobiera token z URL i ustawia is_email_verified=True.
    """
    try:
        profile = Profile.objects.get(email_verification_token=token)
        
        if profile.is_email_verified:
            return Response(
                {"detail": "Email już został zweryfikowany."},
                status=status.HTTP_200_OK
            )
        
        profile.is_email_verified = True
        # opcjonalnie: reset tokena po użyciu
        # import uuid
        # profile.email_verification_token = uuid.uuid4()
        profile.save()

        return Response(
            {"detail": "Email zweryfikowany pomyślnie!"},
            status=status.HTTP_200_OK
        )
    
    except Profile.DoesNotExist:
        return Response(
            {"detail": "Nieprawidłowy token."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
def send_verification_email(user_email, token):
    """
    Wysyła link weryfikacyjny na podany email.
    """
    verification_link = f"http://127.0.0.1:8000/api/verify-email/{token}/"
    subject = "Potwierdź swój email"
    message = f"Cześć!\n\nKliknij w link, aby zweryfikować swój email:\n{verification_link}"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])

    # POST /api/surveys/{id}/rate/
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        """
        Przyjmuje oceny 1–5 dla 1–5 pytań.
        """
        survey = self.get_object()
        answers = request.data.get("answers")

        if not answers or not isinstance(answers, list):
            return Response(
                {"detail": "answers must be a list"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(answers) > 5:
            return Response(
                {"detail": "Można ocenić maksymalnie 5 pytań naraz"},
                status=status.HTTP_400_BAD_REQUEST
            )

        for answer in answers:
            question_id = answer.get("question_id")
            value = answer.get("value")

            if value not in [1, 2, 3, 4, 5]:
                return Response(
                    {"detail": "Rating must be between 1 and 5"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                question = Question.objects.get(
                    id=question_id,
                    survey=survey
                )
            except Question.DoesNotExist:
                return Response(
                    {"detail": f"Question {question_id} does not exist"},
                    status=status.HTTP_404_NOT_FOUND
                )

            rating = question.rating
            rating.add_vote(value)

        return Response(
            {"detail": "Oceny zapisane poprawnie"},
            status=status.HTTP_200_OK
        )
