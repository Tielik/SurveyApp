from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Survey, Question, Choice
#prototyp model ankiety tu jest przerabiana na JSON
class ChoiceSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(read_only=True)
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'votes']
        read_only_fields = ['votes']


class QuestionSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(read_only=True)
    choices = ChoiceSerializer(many=True, read_only=True, source='choice_set')

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices']

class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True, source='question_set')

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions', 'access_code', 'is_active']
        read_only_fields = ['access_code']
        def create(self, validated_data):
            # 1. Wyciągamy pytania z danych
            questions_data = validated_data.pop('question_set')

            # 2. Tworzymy Ankietę
            survey = Survey.objects.create(**validated_data)

            # 3. Pętla po pytaniach
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
            # 1. Aktualizacja prostych pól Ankiety
            instance.title = validated_data.get('title', instance.title)
            instance.description = validated_data.get('description', instance.description)
            instance.is_active = validated_data.get('is_active', instance.is_active)
            instance.save()

            # 2. Obsługa pytań (Strategia: Usuń stare i stwórz nowe)
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

#model użytkowników
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'username','password']
        #ukrywanie by api nigdy nie zwracało przy odczycie
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        #dzięki temu przy tworzeniu nowego użytkownika hasło jest szyfrowane
        user = User.objects.create_user(**validated_data)
        return user