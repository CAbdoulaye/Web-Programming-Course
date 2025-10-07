import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    uin: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
          // Password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    // At least 8 chars, one uppercase, one lowercase, one number

    if (!passwordRegex.test(formData.password)) {
      return alert(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number."
      );
    }

    if (formData.uin.length !== 8) {
      return alert("UIN must be exactly 8 characters.");
    }
    try {
      // console.log(formData);
      const res = await axios.post("http://localhost:8080/user/register", formData);
      alert(res.data.message);
      navigate(`/verify2fa/${formData.email}`);
      // navigate("/login");
    } catch (err) {
      alert(err.response.data.message || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input name="uin" placeholder="UIN" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
