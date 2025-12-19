import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/dashboard'
import Vote from './pages/Vote'
import Register from './pages/Register'
import CreateSurvey from './pages/CreateSurvey'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/surveys/create" element={<CreateSurvey />} />

        {/* :code oznacza zmienną (to co wpiszemy w URL trafi do zmiennej code) */}
        <Route path="/vote/:code" element={<Vote />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
