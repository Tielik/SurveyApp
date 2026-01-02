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
