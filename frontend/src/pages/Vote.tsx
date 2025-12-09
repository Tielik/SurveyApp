import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

// Interface'y (Te same co w Dashboard, ale bez zbędnych rzeczy)
interface Choice { id: number; choice_text: string; votes: number; }
interface Question { id: number; question_text: string; choices: Choice[]; }
interface Survey { title: string; description: string; questions: Question[]; }

export default function Vote() {
    const { code } = useParams() // 1. Wyciągamy kod z URL (np. a83-b9z...)
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // 2. Pobieramy ankietę przy wejściu (BEZ TOKENA - to publiczne!)
    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/surveys/vote_access/?code=${code}`)
            .then(response => {
                setSurvey(response.data)
                setLoading(false)
            })
            .catch(err => {
                setError("Nie znaleziono ankiety lub jest nieaktywna.")
                setLoading(false)
            })
    }, [code])

    // 3. Funkcja głosowania
    const handleVote = (choiceId: number, questionId: number) => {
        axios.post(`http://127.0.0.1:8000/api/choices/${choiceId}/vote/`)
            .then(response => {
                alert("Dziękujemy za głos!")

                // (Opcjonalnie) Szybka aktualizacja licznika na ekranie bez odświeżania
                if (!survey) return;
                const updatedQuestions = survey.questions.map(q => {
                    if (q.id !== questionId) return q;
                    // Znaleźliśmy pytanie, teraz szukamy opcji
                    const updatedChoices = q.choices.map(c =>
                        c.id === choiceId ? { ...c, votes: c.votes + 1 } : c
                    )
                    return { ...q, choices: updatedChoices }
                })
                setSurvey({ ...survey, questions: updatedQuestions })
            })
            .catch(err => alert("Błąd głosowania."))
    }

    // --- WIDOKI STANÓW ---
    if (loading) return <div className="p-10 text-center">Ładowanie ankiety...</div>
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>
    if (!survey) return null

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

                {/* Nagłówek Ankiety */}
                <div className="bg-blue-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
                    <p className="opacity-90">{survey.description}</p>
                </div>

                {/* Lista Pytań */}
                <div className="p-8 space-y-8">
                    {survey.questions.map(q => (
                        <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {q.question_text}
                            </h3>

                            {/* Przyciski Głosowania */}
                            <div className="grid gap-3">
                                {q.choices.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleVote(c.id, q.id)}
                                        className="flex justify-between items-center w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition group text-left"
                                    >
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                            {c.choice_text}
                                        </span>
                                        {/* Pokazujemy liczbę głosów (możesz to ukryć jeśli chcesz tajne głosowanie) */}
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                                            {c.votes} gł.
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Powered by SurveyPlatform
                </div>

            </div>
        </div>
    )
}