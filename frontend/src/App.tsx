import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vote from './pages/Vote'
import Register from './pages/Register'
import CreateSurvey from './pages/CreateSurvey'
import EditSurvey from './pages/EditSurvey'
import SurveyResults from './pages/SurveyResults'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/surveys/create" element={<CreateSurvey />} />
        <Route path="/surveys/:id/edit" element={<EditSurvey />} />
        <Route path="/surveys/:id/results" element={<SurveyResults />} />

        {/* :code oznacza zmienną (to co wpiszemy w URL trafi do zmiennej code) */}
        <Route path="/vote/:code" element={<Vote />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
