import './App.css'
import LogIn from './components/LogIn'
import Desk from './components/Desk'
import Desktop from './components/Desktop'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/desk" element={<Desk />} />
        <Route path="/desktop/:id" element={<Desktop />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
