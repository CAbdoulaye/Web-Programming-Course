import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import TwoFactorForm from './pages/TwoFactorForm';
import { UserProvider } from './contexts/UserContext';
import ChangePassword from './pages/ChangePassword';
import ForgotPasswordRequest from './pages/ForgotPasswordRequest';
import ForgotPasswordVerify from './pages/ForgotPasswordVerify';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <UserProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/verify2fa/:email" element={<TwoFactorForm />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-pass-request" element={<ForgotPasswordRequest />} />
        <Route path="/forgot-pass-verify/:email" element={<ForgotPasswordVerify />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
