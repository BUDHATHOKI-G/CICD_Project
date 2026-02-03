import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from './pages/forgotPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={
        <ForgotPassword 
      onNavigateToLogin={() => window.location.href = '/'} 
    />
  }  />
      </Routes>
    </Router>
  );
}
