import Login from "./Pages/Login"
import Register from "./Pages/Register"
import Home from "./Pages/Home"
import AdminDashboard from "./Admin/AdminDashboard"
import DoctorDashboard from "./Doctor/DoctorDashboard"
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProtectedRoute from "./ProtectedRoute"

function App() {
  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute >} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
