import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart3, ExternalLink, Pencil } from 'lucide-react'

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
    const navigate = useNavigate()

    const fetchSurveys = useCallback(() => {
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
    }, [navigate])

    useEffect(() => {
        fetchSurveys()
    }, [fetchSurveys])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const toggleActive = (survey: Survey) => {
        const token = localStorage.getItem('token')

        const updatedSurveys = surveys.map(s =>
            s.id === survey.id ? { ...s, is_active: !s.is_active } : s
        )
        setSurveys(updatedSurveys)

        axios.patch(`http://127.0.0.1:8000/api/surveys/${survey.id}/`,
            { is_active: !survey.is_active },
            { headers: { 'Authorization': `Token ${token}` } }
        )
            .then(() => {
                toast.success(!survey.is_active ? "Ankieta opublikowana" : "Ankieta przeniesiona do szkiców")
            })
            .catch(() => {
                toast.error("Błąd aktualizacji statusu")
                fetchSurveys()
            })
    }

    return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center border border-white/20">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                            Panel Zarządzania
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Twórz ankiety i śledź wyniki na żywo</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <Link
                            to="/surveys/create"
                            className="cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            Utwórz ankietę
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="cursor-pointer flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Wyloguj
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Twoje Ankiety</h2>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                        Liczba: {surveys.length}
                    </span>
                </div>

                {surveys.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg">Brak ankiet. Utwórz pierwszą w kreatorze.</p>
                        <Link to="/surveys/create" className="mt-4 inline-flex px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700">
                            Otwórz kreator
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {surveys.map(survey => (
                            <div key={survey.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                                
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{survey.title}</h3>
                                        <p className="text-gray-500 text-sm">{survey.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => toggleActive(survey)}
                                            className={`
                                                cursor-pointer px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors
                                                ${survey.is_active 
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" 
                                                    : "bg-gray-200 text-gray-500 hover:bg-gray-300 border border-gray-300"
                                                }
                                            `}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${survey.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                            {survey.is_active ? "Opublikowana" : "Szkic"}
                                        </button>
                                        <span className="text-xs text-gray-400 font-mono">ID: {survey.id}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1">
                                    <h4 className="font-semibold text-xs text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                        Pytania
                                    </h4>
                                    
                                    {survey.questions.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 italic text-sm">Brak pytań.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {survey.questions.map((q, idx) => (
                                                <div key={q.id} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                                    <p className="font-semibold text-gray-800 text-sm mb-2">
                                                        {idx + 1}. {q.question_text}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {q.choices.map(c => (
                                                            <span key={c.id} className="text-xs font-medium bg-white px-3 py-1.5 rounded-lg text-indigo-600 border border-indigo-100 shadow-sm flex items-center gap-2">
                                                                {c.choice_text}
                                                                <span className="bg-indigo-100 text-indigo-800 px-1.5 rounded text-[10px] font-bold">
                                                                    {c.votes}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm overflow-hidden">
                                        <button
                                            type="button"
                                            className="hover:bg-indigo-600 rounded-full hover:text-white p-2 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`/vote/${survey.access_code}`)
                                                    .then(() => toast.success("Link skopiowany!"))
                                                    .catch(() => toast.error("Blad kopiowania"));
                                            }}
                                            title="Kopiuj link do glosowania"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </button>
                                        <span className="break-all font-mono text-xs">/vote/{survey.access_code}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/surveys/${survey.id}/results`}
                                            state={{ survey }}
                                            className="hover:bg-indigo-600 rounded-full hover:text-white p-2 transition-colors"
                                            title="Zobacz wyniki ankiety"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                            <span className="sr-only">Wyniki</span>
                                        </Link>
                                        <Link
                                            to={`/surveys/${survey.id}/edit`}
                                            className="hover:bg-indigo-600 rounded-full hover:text-white p-2 transition-colors"
                                            title="Edytuj ankiete"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edytuj</span>
                                        </Link>
                                        <Link
                                            to={`/vote/${survey.access_code}`}
                                            target="_blank"
                                            className="hover:bg-indigo-600 rounded-full hover:text-white p-2 transition-colors"
                                            title="Otworz glosowanie"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="sr-only">Otworz glosowanie</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                        )}
            </div>
        </div>
    )
}



