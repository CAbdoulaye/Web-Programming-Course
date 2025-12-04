import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext.js";

function Advising() {
  const { userEmail } = useUser();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [advisingSheets, setAdvisingSheets] = useState([]);
  const [graduationSemester, setGraduationSemester] = useState("");
  const [major, setMajor] = useState("");
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedPlanned, setSelectedPlanned] = useState([]);
  const [message, setMessage] = useState("");
  const [editingSheetId, setEditingSheetId] = useState(null);

  // Fetch user id by email on mount
  useEffect(() => {
    if (!userEmail) {
      alert("Not logged In");
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/profile/id/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.u_ID); // Adjust based on backend response key
        if (data.major) setMajor(data.major); // Optionally set major if available from profile
      })
      .catch(() => setMessage("Failed to fetch user info"));
  }, [userEmail]);

  // Fetch courses
  useEffect(() => {
    fetch("http://localhost:8080/advising/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setMessage("Failed to load courses"));
  }, []);

  // Fetch advising sheets for this user
  const loadSheets = () => {
    if (!userId) return;
    fetch(`http://localhost:8080/advising/student/${userId}`)
      .then((res) => res.json())
      .then(setAdvisingSheets)
      .catch(() => setMessage("Failed to load advising sheets"));
  };

  useEffect(() => {
    if (userId) loadSheets();
  }, [userId]);

  // Handle submit new advising sheet
  const handleCreateSheet = async () => {
    if (!graduationSemester) return alert("Please enter a graduation semester");
    if (!major) return alert("Please enter your major");

    try {
      // 1. Create advising sheet
      const res1 = await fetch("http://localhost:8080/advising/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: userId,
          major,
          graduation_semester: graduationSemester,
        }),
      });

      const data1 = await res1.json();
      if (!data1.advisingSheetId) throw new Error("Failed to create sheet");
      const sheetId = data1.advisingSheetId;

      // 2. Add history courses if any
      if (selectedHistory.length > 0) {
        await fetch("http://localhost:8080/advising/history/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            advising_sheet_id: sheetId,
            course_ids: selectedHistory,
          }),
        });
      }

      // 3. Add planned courses if any
      if (selectedPlanned.length > 0) {
        await fetch("http://localhost:8080/advising/planned/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            advising_sheet_id: sheetId,
            course_ids: selectedPlanned,
          }),
        });
      }

      alert("Advising sheet submitted!");
      setGraduationSemester("");
      setSelectedHistory([]);
      setSelectedPlanned([]);
      loadSheets();
    } catch (err) {
      alert("Failed to submit advising sheet");
    }
  };

  return (
    <div className="container">
      <h2>Advising Sheets</h2>

      <div>
        <label>Graduation Semester</label>
        <input
          type="text"
          placeholder="Fall 2025"
          value={graduationSemester}
          onChange={(e) => setGraduationSemester(e.target.value)}
        />
      </div>

      <div>
        <label>Major</label>
        <input
          type="text"
          placeholder="Your major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        />
      </div>

      <div>
        <label>History Courses (Taken)</label>
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "0.5rem",
          }}
        >
          {courses.map((c) => (
            <div key={c.id}>
              <label>
                <input
                  type="checkbox"
                  value={c.id}
                  checked={selectedHistory.includes(c.id)}
                  onChange={(e) => {
                    const courseId = c.id;
                    if (e.target.checked) {
                      setSelectedHistory([...selectedHistory, courseId]);
                      // Optionally prevent selecting same course in planned
                      setSelectedPlanned(selectedPlanned.filter((id) => id !== courseId));
                    } else {
                      setSelectedHistory(selectedHistory.filter((id) => id !== courseId));
                    }
                  }}
                />{" "}
                {c.course_code} — {c.course_name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Planned Courses</label>
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "0.5rem",
          }}
        >
          {courses.map((c) => (
            <div key={c.id}>
              <label>
                <input
                  type="checkbox"
                  value={c.id}
                  checked={selectedPlanned.includes(c.id)}
                  onChange={(e) => {
                    const courseId = c.id;
                    if (e.target.checked) {
                      setSelectedPlanned([...selectedPlanned, courseId]);
                      // Optionally prevent selecting same course in history
                      setSelectedHistory(selectedHistory.filter((id) => id !== courseId));
                    } else {
                      setSelectedPlanned(selectedPlanned.filter((id) => id !== courseId));
                    }
                  }}
                />{" "}
                {c.course_code} — {c.course_name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleCreateSheet}>Submit Advising Sheet</button>

      <hr />

      <h3>Your Advising Sheets</h3>

      {advisingSheets.length === 0 ? (
        <p>No advising sheets found.</p>
      ) : (
        advisingSheets.map((sheet) => {
          const isPending = sheet.status === "Pending";
          return (
            <div
              key={sheet.advising_ID}
              style={{ border: "1px solid gray", marginBottom: "1rem", padding: "1rem" }}
            >
              <h4>
                Graduation Semester: {sheet.graduation_semester} — Status: {sheet.status}
              </h4>

              {/* Editable only when pending */}
              {isPending && (
                <>
                  <h5>Edit History Courses</h5>
                  {courses.map((c) => (
                    <div key={c.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={sheet.history.some((h) => h.id === c.id)}
                          onChange={async (e) => {
                            const checked = e.target.checked;

                            let updated = sheet.history.map((h) => h.id);
                            if (checked) {
                              updated.push(c.id);
                            } else {
                              updated = updated.filter((id) => id !== c.id);
                            }

                            await fetch("http://localhost:8080/advising/history/add", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                advising_sheet_id: sheet.advising_ID,
                                course_ids: updated,
                              }),
                            });

                            loadSheets();
                          }}
                        />
                        {c.course_code} — {c.course_name}
                      </label>
                    </div>
                  ))}

                  <h5 style={{ marginTop: "1rem" }}>Edit Planned Courses</h5>
                  {courses.map((c) => (
                    <div key={c.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={sheet.planned.some((p) => p.id === c.id)}
                          onChange={async (e) => {
                            const checked = e.target.checked;

                            let updated = sheet.planned.map((p) => p.id);
                            if (checked) {
                              updated.push(c.id);
                            } else {
                              updated = updated.filter((id) => id !== c.id);
                            }

                            await fetch("http://localhost:8080/advising/planned/add", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                advising_sheet_id: sheet.advising_ID,
                                course_ids: updated,
                              }),
                            });

                            loadSheets();
                          }}
                        />
                        {c.course_code} — {c.course_name}
                      </label>
                    </div>
                  ))}
                </>
              )}

              {/* READ ONLY WHEN NOT PENDING */}
              {!isPending && (
                <>
                  <strong>History Courses:</strong>
                  <ul>
                    {sheet.history.map((c) => (
                      <li key={c.id}>{c.course_code} — {c.course_name}</li>
                    ))}
                  </ul>

                  <strong>Planned Courses:</strong>
                  <ul>
                    {sheet.planned.map((c) => (
                      <li key={c.id}>{c.course_code} — {c.course_name}</li>
                    ))}
                  </ul>
                </>
              )}

              {sheet.admin_comment && (
                <p style={{ color: "red" }}>Admin Comment: {sheet.admin_comment}</p>
              )}
            </div>
          );
        })

      )}


      <p>{message}</p>
    </div>
  );
}

export default Advising;