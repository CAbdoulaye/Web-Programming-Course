import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminAdvising() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const navigate = useNavigate();

  const loadSheets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/advising/admin/all");
      setSheets(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load advising sheets");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSheets();
  }, []);

  const openDetail = (sheet) => {
    setSelected(sheet);
    setRejectComment("");
  };

  const closeDetail = () => {
    setSelected(null);
    setRejectComment("");
  };

  const approveSheet = async () => {
    if (!selected) return;
    try {
      const res = await axios.put(
        `http://localhost:8080/advising/admin/approve/${selected.advising_ID}`
      );
      alert("Approved");
      loadSheets();
      closeDetail();
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const rejectSheet = async () => {
    if (!selected) return;
    if (!rejectComment.trim()) return alert("Comment required");

    try {
      const res = await axios.put(
        `http://localhost:8080/advising/admin/reject/${selected.advising_ID}`,
        { comment: rejectComment }
      );
      alert("Rejected");
      loadSheets();
      closeDetail();
    } catch (err) {
      console.error(err);
      alert("Failed to reject");
    }
  };

  const openInStudentForm = (sheet) => {
    navigate(`/advising?sheetId=${sheet.id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin – Advising Sheets</h2>

      {loading ? (
        <p>Loading…</p>
      ) : sheets.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Date</th>
              <th>Term</th>
              <th>Student</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sheets.map((s) => (
              <tr key={s.advising_ID}>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>{s.graduation_semester}</td>
                <td>
                  {s.u_first_name} {s.u_last_name}
                  <br />
                  <small>{s.u_email}</small>
                </td>
                <td>{s.status}</td>
                <td>
                  <button onClick={() => openDetail(s)}>View</button>
                  <button
                    onClick={() => openInStudentForm(s)}
                    style={{ marginLeft: 10 }}
                  >
                    Open in Form
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div
          style={{
            marginTop: 25,
            padding: 15,
            border: "1px solid #ddd",
            borderRadius: 5,
          }}
        >
          <h3>Submission Detail</h3>

          <p>
            <strong>Student:</strong> {selected.u_first_name}{" "}
            {selected.u_last_name} ({selected.u_email})
          </p>
          <p>
            <strong>Term:</strong> {selected.graduation_semester}
          </p>
          <p>
            <strong>Status:</strong> {selected.status}
          </p>

          {/* History */}
          <h4>History</h4>
          <ul>
            {selected.history.map((c) => (
              <li key={c.id}>
                {c.course_code} – {c.course_name}
              </li>
            ))}
          </ul>

          {/* Planned */}
          <h4>Planned</h4>
          <ul>
            {selected.planned.map((c) => (
              <li key={c.id}>
                {c.course_code} – {c.course_name}
              </li>
            ))}
          </ul>

          {selected.status === "Pending" ? (
            <>
              <button onClick={approveSheet}>Approve</button>
              <button
                onClick={rejectSheet}
                style={{ marginLeft: 10, background: "#f55", color: "white" }}
              >
                Reject
              </button>

              <div style={{ marginTop: 15 }}>
                <label>
                  <strong>Rejection Comment:</strong>
                </label>
                <textarea
                  rows={3}
                  style={{ width: "100%" }}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />
              </div>
            </>
          ) : (
            <p>
              <strong>Admin Comment:</strong>{" "}
              {selected.admin_comment || "(none)"}
            </p>
          )}

          <button
            onClick={closeDetail}
            style={{ marginTop: 15, background: "#ddd" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminAdvising;