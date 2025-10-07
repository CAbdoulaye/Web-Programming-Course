import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext.js"; 
// import "./Navbar.css";

function Navbar() {
  const { userEmail, setUserEmail } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserEmail(null);         // Clear user from context
    localStorage.removeItem("token"); // Optional: clear token
    navigate("/login");         // Redirect to login
  };

  return (
    <nav>
      {!userEmail ? (
        <>
          <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          <Link to="/home">Home</Link> |{" "}
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </>
      )}
    </nav>
  );
}

export default Navbar;
