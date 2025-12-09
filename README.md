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

przykładowy link publiczny

Link publiczny:/vote/7db160e5-092c-4d6a-bb8d-884e4fe069e6

http://localhost:5173/vote/7db160e5-092c-4d6a-bb8d-884e4fe069e6

istnieje też dashboard: http://localhost:5173/dashboard

ale najpierw trzeba się zalogować.

