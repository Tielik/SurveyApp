from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Survey, Question, Choice, Profile
from django.contrib.auth.password_validation import validate_password


# prototyp model ankiety tu jest przerabiana na JSON
class ChoiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all(), write_only=True)

    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'votes', 'question']
        read_only_fields = ['votes']


class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    choices = ChoiceSerializer(many=True, read_only=True, source='choice_set')
    survey = serializers.PrimaryKeyRelatedField(queryset=Survey.objects.all(), write_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices', 'survey']


class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True, source='question_set')

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions', 'access_code', 'is_active', 'color_1', 'color_2',
                  'color_3']
        read_only_fields = ['access_code']

        def create(self, validated_data):
            #  Wyciągamy pytania z danych
            questions_data = validated_data.pop('question_set')
            # Tworzymy Ankietę
            survey = Survey.objects.create(**validated_data)
            #  Pętla po pytaniach
            for question_data in questions_data:
                choices_data = question_data.pop('choice_set')
                # Tworzymy pytanie przypisane do ankiety
                question = Question.objects.create(survey=survey, **question_data)
                # 4. Pętla po opcjach
                for choice_data in choices_data:
                    # Tworzymy opcję przypisaną do pytania
                    Choice.objects.create(question=question, **choice_data)
            return survey

        # --- LOGIKA DLA PUT (Edycja wszystkiego naraz) ---
        def update(self, instance, validated_data):
            # Aktualizacja prostych pól Ankiety
            instance.title = validated_data.get('title', instance.title)
            instance.description = validated_data.get('description', instance.description)
            instance.is_active = validated_data.get('is_active', instance.is_active)
            instance.color_1 = validated_data.get('color_1', instance.color_1)
            instance.color_2 = validated_data.get('color_2', instance.color_2)
            instance.color_3 = validated_data.get('color_3', instance.color_3)
            instance.save()
            #  Obsługa pytań (Strategia: Usuń stare i stwórz nowe)
            # To najprostsza strategia dla prototypu. Przy PUT kasujemy stare pytania
            # i wstawiamy te, które przyszły w JSON.
            if 'question_set' in validated_data:
                questions_data = validated_data.pop('question_set')
                # Usuwamy stare pytania tej ankiety
                instance.question_set.all().delete()
                # Tworzymy nowe (identycznie jak w create)
                for question_data in questions_data:
                    choices_data = question_data.pop('choice_set')
                    question = Question.objects.create(survey=instance, **question_data)
                    for choice_data in choices_data:
                        Choice.objects.create(question=question, **choice_data)
            return instance


# model użytkowników
class UserSerializer(serializers.ModelSerializer):
    # Dodajemy pola z profilu
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)
    background_image = serializers.ImageField(source='profile.background_image', required=False, allow_null=True)
    color_1 = serializers.CharField(source='profile.color_1', required=False)
    color_2 = serializers.CharField(source='profile.color_2', required=False)
    color_3 = serializers.CharField(source='profile.color_3', required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'avatar', 'background_image', 'color_1', 'color_2', 'color_3']
        # ukrywanie by api nigdy nie zwracało przy odczycie
        extra_kwargs = {'password': {'write_only': True},
                        'email': {'required': True}}

    # Sprawdza czy konto z podanym mailem już istnieje
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Konto z tym adresem email już istnieje."
            )
        return value

    def create(self, validated_data):
        # Tworzymy użytkownika z poprawnym hasłem i mailem.
        # Wyciągamy tylko pola obsługiwane przez model User (username, email, password),
        # resztę pól (avatar, kolory) obsłużymy w update() lub w logice profilu.
        user_fields = {k: validated_data[k] for k in ['username', 'email', 'password']}
        user = User.objects.create_user(**user_fields)
        return user

    def update(self, instance, validated_data):
        # Obsługa pól profilu (avatar/background)
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        # Aktualizacja User (np. username)
        instance.username = validated_data.get('username', instance.username)
        email = validated_data.get('email', instance.email)
        instance.email = email  # upewniamy się, że email zostanie zapisany
        instance.save()

        # Aktualizacja Profile
        if 'avatar' in profile_data:
            profile.avatar = profile_data['avatar']
        if 'background_image' in profile_data:
            profile.background_image = profile_data['background_image']
        if 'color_1' in profile_data:
            profile.color_1 = profile_data['color_1']
        if 'color_2' in profile_data:
            profile.color_2 = profile_data['color_2']
        if 'color_3' in profile_data:
            profile.color_3 = profile_data['color_3']
        profile.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Hasła nie są identyczne."})
        return attrs
