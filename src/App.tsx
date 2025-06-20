import './App.css'
import LogIn from './components/LogIn'
import Desktop from './components/Desktop'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeBoard from './components/Desk';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/home-board" element={<HomeBoard />} />
        <Route path="/desktop/:id" element={<Desktop />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
