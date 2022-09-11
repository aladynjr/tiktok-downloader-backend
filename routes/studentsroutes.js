var express = require('express');
var router = express.Router();
const pool = require('../db');


//get all users 
router.get("/", async (req, res) => {
    try {
        const allStudents = await pool.query('SELECT * FROM student');

        res.json(allStudents.rows);

    } catch (err) {
        console.log(err.message)
    }
})

//get a single student 
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const student = await pool.query('SELECT * FROM student WHERE student_uid = $1', [id]);

        res.json(student.rows[0]);

    } catch (err) {
        console.log(err.message)
    }
})

//delete a student
router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params
        const deleteStudents = await pool.query('DELETE FROM student * WHERE student_id = $1', [id]);

        res.json('student deleted !');

    } catch (err) {
        console.log(err.message)
    }
})


//create a student 
router.post('/', async (req, res) => {
    try {
        const {
            student_uid,
            student_email,
            student_name,
            student_grade,
            student_state,
            student_school
        } = req.body

        const newUser = await pool.query(`
        INSERT INTO student (
            student_uid,
            student_email,
            student_name,
            student_grade,
            student_state,
            student_school
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,

            [student_uid,
            student_email,
            student_name,
            student_grade,
            student_state,
            student_school]);

        res.json(newUser.rows);

    } catch (err) {
        console.log(err.message)
    }
}
)





module.exports = router;

