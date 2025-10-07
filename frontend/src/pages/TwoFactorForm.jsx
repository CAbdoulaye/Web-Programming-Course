import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";


export default function TwoFactorForm() {

  // const { setUser } = useUser();
  const { setUserEmail } = useUser();
  const navigate = useNavigate();
  const { email } = useParams();
  const [code, setCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/user/verify", { email, code });
      // setUser(res.data.user);
      setUserEmail(email);
      localStorage.setItem("token", res.data.token);
      alert(res.data.message);
      navigate("/home");
      
      // TODO: redirect to dashboard/home page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "2FA verification failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter 2FA Code</h2>
      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Verify</button>
    </form>
  );
}
