import { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8080/user/");
        setUsers(res.data.result);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>ADMIN PORTAL: All Users</h2>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>UIN</th>
            <th>Verified</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.u_ID}>
              <td>{user.u_ID}</td>
              <td>{user.u_first_name}</td>
              <td>{user.u_last_name}</td>
              <td>{user.u_email}</td>
              <td>{user.UIN}</td>
              <td>{user.is_verified ? "Yes" : "No"}</td>
              <td>{user.is_admin ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
