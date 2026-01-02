from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Survey, Question, Choice
from .serializers import SurveySerializer, QuestionSerializer, ChoiceSerializer, UserSerializer, \
    ChangePasswordSerializer
from django.contrib.auth.models import User


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
from api.models import Rating



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
