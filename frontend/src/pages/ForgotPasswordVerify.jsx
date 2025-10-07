import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPasswordVerify() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ code: "", newPassword: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    // At least 8 chars, one uppercase, one lowercase, one number

    if (!passwordRegex.test(formData.newPassword)) {
      return alert(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number."
      );
    }
    try {
      const res = await axios.post("http://localhost:8080/profile/forgot-password/reset", {
        email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="code" placeholder="2FA Code" onChange={handleChange} required />
        <input type="password" name="newPassword" placeholder="New Password" onChange={handleChange} required />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ForgotPasswordVerify;