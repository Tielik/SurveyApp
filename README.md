jak odpalić backend
z venv
python manage.py runserver

📂 Struktura Projektu

survey-platform/  
 backend/                # API (Django)  
  api/                # Aplikacja z logiką ankiet  
   models.py       # Definicja Ankiety, Pytania, Odpowiedzi  
   serializers.py  # Zamiana danych na JSON  
   views.py        # Logika (kto co może widzieć)  
   urls.py         # Routing API  
   core/               # Ustawienia główne (settings.py)  
  manage.py           # zarządzanie Django  
  
frontend/               # Klient (React)  
src/  
 pages/          # Ekrany aplikacji  
  Login.tsx     # Logowanie  
  Dashboard.tsx # Panel zarządzania (dla twórcy)  
  Vote.tsx      # Ekran głosowania (dla publiczności)  
  App.tsx         # Główna mapa routingu  
  main.tsx        # Punkt wejścia  


 API Endpoints (Jak to działa?)

Backend wystawia dane pod adresem http://127.0.0.1:8000/api/.

Metoda Endpoint Opis Wymaga Logowania?

POST

/api-token-auth/

Wymiana loginu/hasła na Token

❌ Nie

GET

/api/surveys/

Lista Twoich ankiet

✅ Tak

POST

/api/surveys/

Tworzenie nowej ankiety

✅ Tak

GET

/api/surveys/vote_access/?code=UUID

Pobranie ankiety publicznej

❌ Nie

POST

/api/choices/{id}/vote/

Oddanie głosu

❌ Nie
POST
/api/register
dodanie uzytkownika z dodaniem mu jego klucza (brakuje walidacji)
❌ Nie

DELETE
/api/surveys/5/ (z tokenem plus musi być ankieta wyłączona)
usuwa ankiete pytania i odpowiedzi

POST
przykąłdowy json ankietowy:
{
    "title": "Wielka Ankieta Backendowa",
    "description": "Testowanie zapisu zagnieżdżonego",
    "is_active": true,
    "questions": [
        {
            "question_text": "Jaki jest najlepszy framework?",
            "choices": [
                {"choice_text": "Django"},
                {"choice_text": "Express"},
                {"choice_text": "Spring"}
            ]
        },
        {
            "question_text": "Czy lubisz pizzę?",
            "choices": [
                {"choice_text": "Tak"},
                {"choice_text": "Oczywiście, że tak"}
            ]
        }
    ]
}

przykładowy link publiczny

Link publiczny:/vote/7db160e5-092c-4d6a-bb8d-884e4fe069e6

http://localhost:5173/vote/7db160e5-092c-4d6a-bb8d-884e4fe069e6

istnieje też dashboard: http://localhost:5173/dashboard

ale najpierw trzeba się zalogować.

uper user
admin 
h: 123

## 👤 Zarządzanie Profilem i Kontem

> Wszystkie endpointy wymagają nagłówka autoryzacji:  
> `Authorization: Token <twój_token>`

| Metoda | Endpoint                          | Opis                                              | Wymaga logowania | Parametry (Body) |
|------:|-----------------------------------|---------------------------------------------------|:----------------:|------------------|
| GET   | `/api/profile/me/`                | Pobranie danych profilu (username, zdjęcia)       | ✅ Tak           | — |
| PATCH | `/api/profile/me/`                | Aktualizacja profilu                              | ✅ Tak           | `form-data`:<br>• `avatar` (file)<br>• `background_image` (file)<br>• `username` (text) |
| PATCH | `/api/profile/me/`                | Usunięcie awatara lub zdjęcia tła                 | ✅ Tak           | `JSON`:<br>`{"avatar": null}`<br>lub<br>`{"background_image": null}` |
| POST  | `/api/profile/change-password/`   | Bezpieczna zmiana hasła                           | ✅ Tak           | `JSON`:<br>`{"old_password": "...", "new_password": "..."}` |
| DELETE| `/api/profile/me/`                | Usunięcie konta i wszystkich ankiet (CASCADE)     | ✅ Tak           | — |
| POST  | `/api/register/`                  | Rejestracja użytkownika                           | ❌ Nie           | `JSON`:<br>`{"username": "...", "email": "...", "password": "..."}`|
| GET   | `/api/verify-email/<uuid:token>/` | Weryfikacja email                                 | ❌ Nie           | - |
| POST  | `/api/surveys/{survey_id}/rate/`  | pytania 1-5                                       | ✅ Tak           | `JSON`:<br>` {"answers":[{"question_id": "...", "value": "..."}]}` |

