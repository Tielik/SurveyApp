from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Survey, Question, Choice
#prototyp model ankiety tu jest przerabiana na JSON
class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'votes']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True, source='choice_set')

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices']

class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True, source='question_set')

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions', 'access_code', 'is_active']

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