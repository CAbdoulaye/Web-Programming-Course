import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext.js";
import { useNavigate } from "react-router-dom";

function Home() {
  const { userEmail } = useUser();
  const navigate = useNavigate();

  const [user, setUser] = useState({ firstName: "", lastName: "", UIN: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:8080/profile/${userEmail}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          if (data.is_admin) {
            navigate("/admin/users"); // redirect admin
          }
        })
        .catch(() => setMessage("Error loading profile"));
    }
  }, [userEmail]);

  const handleUpdate = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch("http://localhost:8080/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          firstName: user.u_first_name,
          lastName: user.u_last_name,
          uin: user.UIN,
        }),
      });
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const goToChangePassword = () => {
    navigate("/change-password");
  };

  const goToAdvising = () => {
    navigate("/advising");
  };

  return (
    <div className="container">
      <h2>Welcome to your profile {user.u_first_name}</h2>
      <button onClick={goToChangePassword}>Change Password</button>
      <button onClick={goToAdvising} style={{ marginLeft: "1rem" }}>
        Go to Advising
      </button>
      <form onSubmit={handleUpdate} style={{ marginTop: "1rem" }}>
        <label>First Name</label>
        <input
          type="text"
          value={user.u_first_name || ""}
          onChange={(e) => setUser({ ...user, u_first_name: e.target.value })}
        />

        <label>Last Name</label>
        <input
          type="text"
          value={user.u_last_name || ""}
          onChange={(e) => setUser({ ...user, u_last_name: e.target.value })}
        />

        <label>Email</label>
        <input type="email" value={userEmail} disabled />

        <label>UIN</label>
        <input
          type="text"
          value={user.UIN || ""}
          onChange={(e) => setUser({ ...user, UIN: e.target.value })}
        />

        <button type="submit">Update</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Home;
