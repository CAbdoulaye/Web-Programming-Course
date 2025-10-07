import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPasswordRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    uin: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/profile/forgot-password/request", formData);
      alert(res.data.message);
      navigate(`/forgot-pass-verify/${formData.email}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send 2FA code");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="text" name="uin" placeholder="UIN" onChange={handleChange} required />
        <button type="submit">Send 2FA Code</button>
      </form>
    </div>
  );
}

export default ForgotPasswordRequest;
