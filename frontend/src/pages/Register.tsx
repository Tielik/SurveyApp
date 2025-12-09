import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()

        // Wysyłamy prośbę o utworzenie konta
        axios.post('http://127.0.0.1:8000/api/register/', {
            username: username,
            password: password
        })
            .then(() => {
                alert("Konto utworzone! Możesz się zalogować.")
                navigate('/') // Przekieruj do logowania
            })
            .catch(err => {
                console.error(err)
                setError("Błąd rejestracji. Może taki użytkownik już istnieje?")
            })
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 font-sans">
            <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-green-600">Załóż konto</h1>

                {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Login</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Hasło</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mb-4">
                    Zarejestruj się
                </button>

                <p className="text-center text-sm">
                    Masz już konto? <Link to="/" className="text-blue-500 hover:underline">Zaloguj się</Link>
                </p>
            </form>
        </div>
    )
}