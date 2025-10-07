import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToForgotPassword = () => {
    navigate("/forgot-pass-request");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // console.log(formData);
      // alert("Redirecting");
      // navigate("/home");
      const res = await axios.post("http://localhost:8080/user/login", formData);
      alert(res.data.message);
      // store token if returned
      // setEmailFor2FA(formData.email);
      // console.log('navigate("/verify2fa");')
      navigate(`/verify2fa/${formData.email}`);
      localStorage.setItem("token", res.data.token);
      // navigate("/home");
    } catch (err) {
      alert(err.response.data.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={goToForgotPassword}>
        Forgot Password
      </button>
    </div>
  );
}

export default Login;
