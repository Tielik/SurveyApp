import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError('') // Czyścimy błędy przed nową próbą
        setLoading(true) // Włączamy loader
        // Wysyłamy login i hasło do Django
        axios.post('http://127.0.0.1:8000/api-token-auth/', {
            username: username,
            password: password
        })
            .then(response => {
                //  Dostaliśmy token
                const token = response.data.token
                console.log("Twój token:", token)

                // Zapisujemy token w przeglądarce
                localStorage.setItem('token', token)

                // Przekierowujemy do panelu głównego
                navigate('/dashboard')
            })
            .catch(err => {
                setError("Błędny login lub hasło!")
                console.error(err)
                setLoading(false)
            })
    }

    return (
<div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 p-4">
            {/* KARTA: Białe tło, zaokrąglone rogi (rounded-2xl), duży cień (shadow-2xl) */}
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all hover:scale-[1.01]">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Witaj ponownie!</h1>
                    <p className="text-gray-500 text-sm mt-2">Zaloguj się, aby kontynuować</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 border border-red-200 text-center animate-pulse">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">Login</label>
                        <div className="relative">
                            {/* Ikona użytkownika (SVG) */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-500"
                                placeholder="Wpisz swój login"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">Hasło</label>
                        <div className="relative">
                            {/* Ikona kłódki (SVG) */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-500"
                                placeholder="************"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className={`
                            cursor-pointer w-full py-3 rounded-lg text-white font-bold shadow-md 
                            transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700'}
                        `}
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>
                <p className="text-center text-gray-500 text-sm mt-8">
                    Nie masz konta?{' '}
                    <Link to="/register" className="text-indigo-600 font-bold hover:underline transition-colors">
                        Zarejestruj się
                    </Link>
                </p>
            </div>
        </div>

    )
}