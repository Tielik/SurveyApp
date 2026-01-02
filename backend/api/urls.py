from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SurveyViewSet, QuestionViewSet, ChoiceViewSet,RegisterView, ProfileViewSet, PasswordViewSet

# Router to taki automatyczny recepcjonista
# Sam stworzy adresy typu /surveys/, /surveys/1/, /questions/ itp.
router = DefaultRouter()
router.register(r'surveys', SurveyViewSet, basename='survey')
router.register(r'questions', QuestionViewSet)
router.register(r'choices', ChoiceViewSet)
router.register(r'register', RegisterView)
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'password', PasswordViewSet, basename='password')
urlpatterns = [
    path('', include(router.urls)),
]