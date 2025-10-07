import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

const ChangePassword = () => {
  const { userEmail } = useUser();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    // At least 8 chars, one uppercase, one lowercase, one number

    if (!passwordRegex.test(newPassword)) {
      return alert(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number."
      );
    }

    const res = await fetch("http://localhost:8080/profile/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, oldPassword, newPassword }),
    });

    const data = await res.json();
    setMessage(data.message || "Password change failed");
  };

  return (
    <div className="container">
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <label>Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ChangePassword;
