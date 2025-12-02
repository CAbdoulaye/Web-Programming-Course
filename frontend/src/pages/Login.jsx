import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [recaptchaToken, setRecaptchaToken] = useState("");

  useEffect(() => {
    const handler = (e) => {
      setRecaptchaToken(e.detail);
    };
    window.addEventListener("recaptcha-success", handler);
    return () => window.removeEventListener("recaptcha-success", handler);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToForgotPassword = () => {
    navigate("/forgot-pass-request");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/user/login", {
        ...formData,
        recaptchaToken,
      });
      alert(res.data.message);
      localStorage.setItem("token", res.data.token);
      navigate(`/verify2fa/${formData.email}`);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      if (window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaToken("");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        {/* reCAPTCHA widget */}
        <div
          className="g-recaptcha"
          data-sitekey="6LeaKx8sAAAAAGdgOmRh_-Jf4fqUMq2gPMWZlhWl"
          data-callback="onRecaptchaSuccess"
        ></div>

        <button type="submit">Login</button>
      </form>
      <button onClick={goToForgotPassword}>Forgot Password</button>
    </div>
  );
}

export default Login;
