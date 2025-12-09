import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface Choice { id: number; choice_text: string; votes: number; }
interface Question { id: number; question_text: string; choices: Choice[]; }
interface Survey {
    id: number;
    title: string;
    description: string;
    questions: Question[];
    access_code: string;
    is_active: boolean;
}

export default function Dashboard() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [newTitle, setNewTitle] = useState('') // Stan dla nowej ankiety
    const navigate = useNavigate()

    // Funkcja pobierająca ankiety
    const fetchSurveys = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/')
            return
        }

        axios.get('http://127.0.0.1:8000/api/surveys/', {
            headers: { 'Authorization': `Token ${token}` }
        })
            .then(response => setSurveys(response.data))
            .catch(error => console.error(error))
    }

    // Pobierz dane przy wejściu na stronę
    useEffect(() => {
        fetchSurveys()
    }, [navigate])

    // Funkcja do tworzenia nowej ankiety
    const createSurvey = (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')

        axios.post('http://127.0.0.1:8000/api/surveys/',
            { title: newTitle, description: "Opis domyślny" },
            { headers: { 'Authorization': `Token ${token}` } }
        )
            .then(() => {
                setNewTitle('') // Wyczyść pole
                fetchSurveys() // Odśwież listę
            })
            .catch(err => alert("Błąd tworzenia: " + err))
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }
    const toggleActive = (survey: Survey) => {
        const token = localStorage.getItem('token')

        // Wysyłamy PATCH (częściowa aktualizacja), żeby zmienić tylko jedno pole
        axios.patch(`http://127.0.0.1:8000/api/surveys/${survey.id}/`,
            { is_active: !survey.is_active }, // Odwracamy wartość (jak jest true to false, jak false to true)
            { headers: { 'Authorization': `Token ${token}` } }
        )
            .then(() => fetchSurveys()) // Odświeżamy widok
            .catch(err => alert("Błąd aktualizacji statusu"))
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">

                {/* Nagłówek */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
                    <h1 className="text-2xl font-bold text-gray-800">Panel Zarządzania</h1>
                    <div className="flex gap-4 items-center">
                        <span className="text-gray-500 text-sm">Zalogowany jako Administrator</span>
                        <button onClick={handleLogout} className="text-red-500 font-bold hover:underline">
                            Wyloguj
                        </button>
                    </div>
                </div>

                {/* Sekcja Tworzenia */}
                <div className="bg-white p-6 rounded shadow mb-8">
                    <h2 className="text-lg font-semibold mb-4">Stwórz nową ankietę</h2>
                    <form onSubmit={createSurvey} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Tytuł ankiety..."
                            className="flex-1 border p-2 rounded"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />
                        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Dodaj
                        </button>
                    </form>
                </div>

                {/* Lista Ankiet */}
                <h2 className="text-xl font-bold mb-4 text-gray-700">Twoje Ankiety ({surveys.length})</h2>

                <div className="space-y-6">
                    {surveys.map(survey => (
                        <div key={survey.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-blue-600">{survey.title}</h3>
                                    <p className="text-gray-500 text-sm">{survey.description}</p>
                                </div>
                                {/* PRZYCISK PUBLIKACJI */}
                                <button
                                    onClick={() => toggleActive(survey)}
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${survey.is_active
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                >
                                    {survey.is_active ? "🟢 Aktywna" : "⚪ Szkic"}
                                </button>
                                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                    ID: {survey.id}
                                </div>
                            </div>

                            {/* Sekcja Pytań */}
                            <div className="bg-gray-50 p-4 rounded mb-4">
                                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Pytania:</h4>
                                {survey.questions.length === 0 ? (
                                    <p className="text-gray-400 italic text-sm">Brak pytań. Dodaj je w panelu admina.</p>
                                ) : (
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {survey.questions.map(q => (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* PĘTLA PO ODPOWIEDZIACH */}
                                                {q.choices.map(c => (
                                                    <span key={c.id} className="text-sm bg-blue-100 px-3 py-1 rounded-full text-blue-800 border border-blue-200">
                                                        {c.choice_text}
                                                        <span className="ml-2 font-bold text-blue-900">({c.votes})</span>
                                                    </span>
                                                ))}

                                                {/* Jeśli tablica jest pusta */}
                                                {q.choices.length === 0 && (
                                                    <span className="text-xs text-red-400">Brak dodanych odpowiedzi! Kliknij "+ Opcja"</span>
                                                )}
                                            </div>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Sekcja Linku Publicznego */}
                            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                                <span className="text-sm font-bold text-blue-800">Link publiczny:</span>
                                <code className="text-xs bg-white px-2 py-1 rounded border">
                                    /vote/{survey.access_code}
                                </code>
                            </div>

                        </div>
                    ))}

                    {surveys.length === 0 && (
                        <p className="text-center text-gray-400 mt-10">Nie masz jeszcze żadnych ankiet.</p>
                    )}
                </div>

            </div>
        </div>
    )
}