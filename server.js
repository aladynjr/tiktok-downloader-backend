const express = require('express');
const cors = require('cors');

const students = require('./routes/studentsroutes');

const app = express();

app.use(express.json())
app.use(cors());

//ROUTES 

//USERS
app.use("/api/student", students)



app.listen(8080, ()=>{
    console.log('listening on port 8080')
})