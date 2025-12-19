import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateSurvey from './pages/CreateSurvey'
import Dashboard from './pages/dashboard'
import EditSurvey from './pages/EditSurvey'
import Login from './pages/Login'
import Register from './pages/Register'
import Vote from './pages/Vote'
import { routes } from './routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.dashboard} element={<Dashboard />} />
        <Route path={routes.surveyCreate} element={<CreateSurvey />} />
        <Route path={routes.surveyEdit()} element={<EditSurvey />} />
        <Route path={routes.vote()} element={<Vote />} />
        <Route path={routes.register} element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
