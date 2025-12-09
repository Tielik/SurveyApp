from django.db import models
from django.contrib.auth.models import User
import uuid


# 1. Model Ankiety
class Survey(models.Model):
    # Przypisujemy ankietę do użytkownika
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # To będzie nasz publiczny link (unikalny ciąg znaków)
    access_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # Czy ankieta jest aktywna/upubliczniona?
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Question(models.Model):
    # Klucz obcy: Pytanie wie, do której Ankiety należy
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)

    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text


class Choice(models.Model):
    # Klucz obcy: Opcja wie, do którego Pytania należy
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)  # Licznik głosów startuje od 0

    def __str__(self):
        return self.choice_text

