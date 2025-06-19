import './App.css'
import LogIn from './components/LogIn'
import Desk from './components/Desk'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/desk" element={<Desk />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
