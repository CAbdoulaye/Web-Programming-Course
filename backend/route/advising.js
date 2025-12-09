import { Router } from "express";
import { connection } from "../database/connection.js";
import { sendEmail } from "../utils/sendmail.js";



const advising = Router();

/* ---------------------------------------------
   1. GET all available courses (for multi-select)
-----------------------------------------------*/
advising.get("/courses", async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      "SELECT id, course_code, course_name, credits, major FROM courses"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// /* ---------------------------------------------
//    2. CREATE advising sheet (NO COURSES HERE ANYMORE)
// -----------------------------------------------*/

advising.post("/create", async (req, res) => {
  const { student_id, major, graduation_semester } = req.body;

  if (!student_id || !major || !graduation_semester) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await connection.promise().query(
      `INSERT INTO advising_sheets 
        (student_id, major, graduation_semester, status, admin_comment, created_at, updated_at) 
       VALUES (?, ?, ?, 'Pending', NULL, NOW(), NOW())`,
      [student_id, major, graduation_semester]
    );

    res.json({
      message: "Advising sheet created",
      advisingSheetId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------------------------------------
   3. ADD HISTORY COURSES (type = 'history')
-----------------------------------------------*/
advising.post("/history/add", async (req, res) => {
  const { advising_sheet_id, course_ids } = req.body;

  if (!advising_sheet_id || !course_ids || course_ids.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // remove previous history entries for this sheet
    await connection
      .promise()
      .query(
        "DELETE FROM advising_sheet_courses WHERE advising_sheet_id = ? AND type='history'",
        [advising_sheet_id]
      );

    // insert new ones
    const values = course_ids.map((id) => [
      advising_sheet_id,
      id,
      "history",
    ]);

    await connection
      .promise()
      .query(
        "INSERT INTO advising_sheet_courses (advising_sheet_id, course_id, type) VALUES ?",
        [values]
      );

    res.json({ message: "History courses saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------
   4. ADD PLANNED COURSES (type = 'planned')
-----------------------------------------------*/
advising.post("/planned/add", async (req, res) => {
  const { advising_sheet_id, course_ids } = req.body;

  if (!advising_sheet_id || !course_ids || course_ids.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // remove previous planned entries for this sheet
    await connection
      .promise()
      .query(
        "DELETE FROM advising_sheet_courses WHERE advising_sheet_id = ? AND type='planned'",
        [advising_sheet_id]
      );

    const values = course_ids.map((id) => [
      advising_sheet_id,
      id,
      "planned",
    ]);

    await connection
      .promise()
      .query(
        "INSERT INTO advising_sheet_courses (advising_sheet_id, course_id, type) VALUES ?",
        [values]
      );

    res.json({ message: "Planned courses saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------
   5. GET advising sheets for a student
   (returns history + planned separately)
-----------------------------------------------*/
advising.get("/student/:id", async (req, res) => {
  const studentId = req.params.id;
 
  try {
    const [sheets] = await connection
      .promise()
      .query(
        `SELECT * FROM advising_sheets 
         WHERE student_id = ? 
         ORDER BY created_at DESC`,
        [studentId]
      );

    for (let sheet of sheets) {
      const [history] = await connection.promise().query(
        `SELECT c.id, c.course_code, c.course_name
        FROM advising_sheet_courses ascourses
        JOIN courses c ON ascourses.course_id = c.id
        WHERE ascourses.advising_sheet_id = ? AND ascourses.type='history'`,
        [sheet.advising_ID]
      );

      const [planned] = await connection.promise().query(
        `SELECT c.id, c.course_code, c.course_name
        FROM advising_sheet_courses ascourses
        JOIN courses c ON ascourses.course_id = c.id
        WHERE ascourses.advising_sheet_id = ? AND ascourses.type='planned'`,
        [sheet.advising_ID]
      );

      sheet.history = history;
      sheet.planned = planned;
    }
    res.json(sheets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------
   6. ADMIN: Get ALL advising sheets + history/planned
-----------------------------------------------*/
advising.get("/admin/all", async (req, res) => {
  try {
    const [sheets] = await connection.promise().query(`
      SELECT asht.*, u.u_first_name, u.u_last_name, u.u_email
      FROM advising_sheets asht
      JOIN users u ON asht.student_id = u.u_ID
      ORDER BY asht.created_at DESC
    `);

    for (let sheet of sheets) {
      const [history] = await connection.promise().query(
        `SELECT c.id, c.course_code, c.course_name
        FROM advising_sheet_courses ascourses
        JOIN courses c ON ascourses.course_id = c.id
        WHERE ascourses.advising_sheet_id = ? AND ascourses.type='history'`,
        [sheet.advising_ID]
      );

      const [planned] = await connection.promise().query(
        `SELECT c.id, c.course_code, c.course_name
        FROM advising_sheet_courses ascourses
        JOIN courses c ON ascourses.course_id = c.id
        WHERE ascourses.advising_sheet_id = ? AND ascourses.type='planned'`,
        [sheet.advising_ID]
      );

      sheet.history = history;
      sheet.planned = planned;
    }


    res.json(sheets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// /* ---------------------------------------------
//    7. ADMIN: Approve sheet
// -----------------------------------------------*/
// advising.put("/admin/approve/:id", async (req, res) => {
//   const advisingId = req.params.id;

//   try {
//     await connection
//       .promise()
//       .query(
//         "UPDATE advising_sheets SET status='Approved', admin_comment=NULL WHERE advising_ID=?",
//         [advisingId]
//       );

//     res.json({ message: "Sheet approved" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

/* ---------------------------------------------
   7. ADMIN: Approve sheet (Sends Email)
-----------------------------------------------*/
advising.put("/admin/approve/:id", async (req, res) => {
  const advisingId = req.params.id;

  try {
    // Get sheet + student info
    const [rows] = await connection
      .promise()
      .query(
        `SELECT asht.*, u.u_first_name, u.u_email
         FROM advising_sheets asht
         JOIN users u ON asht.student_id = u.u_ID
         WHERE asht.advising_ID = ?`,
        [advisingId]
      );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Advising sheet not found" });
    }

    const sheet = rows[0];

    // Update status
    await connection
      .promise()
      .query(
        "UPDATE advising_sheets SET status='Approved', admin_comment=NULL WHERE advising_ID=?",
        [advisingId]
      );

    // ---- SEND APPROVAL EMAIL ----
    const subject = "Your Advising Sheet Has Been Approved";

    const htmlBody = `
      <p>Hi ${sheet.u_first_name},</p>
      <p>Your advising sheet for <strong>${sheet.graduation_semester}</strong> has been <strong>approved</strong>.</p>
      <p>You may now proceed with your next steps.</p>
      <br/>
      <p>Regards,<br/>Your Advisor</p>
    `;

    sendEmail(sheet.u_email, subject, htmlBody);

    res.json({ message: "Sheet approved and email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------------------------------------
   8. ADMIN: Reject sheet (with comment)
-----------------------------------------------*/
advising.put("/admin/reject/:id", async (req, res) => {
  const advisingId = req.params.id;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Rejection comment is required" });
  }

  try {
    await connection
      .promise()
      .query(
        "UPDATE advising_sheets SET status='Rejected', admin_comment=? WHERE advising_ID=?",
        [comment, advisingId]
      );

    res.json({ message: "Sheet rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default advising;