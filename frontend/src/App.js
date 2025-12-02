import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import TwoFactorForm from './pages/TwoFactorForm';
import ChangePassword from './pages/ChangePassword';
import ForgotPasswordRequest from './pages/ForgotPasswordRequest';
import ForgotPasswordVerify from './pages/ForgotPasswordVerify';
import Advising from './pages/Advising';


// Admin Pgaes
import AdminUsers from './pages/AdminUsers';

// Context
import { UserProvider } from './contexts/UserContext';
import AdminAdvising from './pages/AdmindAdvising';

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
        <Route path="/advising" element={<Advising />} />
        <Route path="/verify2fa/:email" element={<TwoFactorForm />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-pass-request" element={<ForgotPasswordRequest />} />
        <Route path="/forgot-pass-verify/:email" element={<ForgotPasswordVerify />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/advising" element={<AdminAdvising />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
