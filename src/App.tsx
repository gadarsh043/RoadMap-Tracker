import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoadmapPage from './pages/RoadmapPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoadmapPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}
