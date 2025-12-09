import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vote from './pages/Vote'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* :code oznacza zmienną (to co wpiszemy w URL trafi do zmiennej code) */}
        <Route path="/vote/:code" element={<Vote />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App