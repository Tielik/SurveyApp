from django.db import models
from django.contrib.auth.models import User
import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver


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


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    background_image = models.ImageField(upload_to='backgrounds/', null=True, blank=True)

    def __str__(self):
        # Sprawdzamy, czy pliki istnieją, aby uniknąć błędów, jeśli pola są puste
        avatar_path = self.avatar.url if self.avatar else "Brak awatara"
        bg_path = self.background_image.url if self.background_image else "Brak tła"

        return f"Profil: {self.user.username} | Avatar: {avatar_path} | BG: {bg_path}"


@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    if created:
        # Gdy powstaje nowy User (np. przez RegisterView), tworzymy mu profil
        Profile.objects.create(user=instance)
    else:
        # Gdy User jest aktualizowany, zapisujemy też zmiany w profilu
        if hasattr(instance, 'profile'):
            instance.profile.save()