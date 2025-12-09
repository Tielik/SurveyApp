import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
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
            })
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Zaloguj się</h1>

                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

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

                <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Wejdź
                </button>
            </form>
        </div>
    )
}