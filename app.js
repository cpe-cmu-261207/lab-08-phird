const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const courses = require('./myCourses.json');
const { callbackify } = require("util");

//to post you must use bodyParser

app.use(express.static("assets"));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
//follow instruction in http://localhost:8000/

const sync = ()=> {
  cal()
  genJSON()
}

const cal = () => {
  let gpax = courses.courses.map(course => {
    return {
      gpa: Number(course.gpa) * Number(course.credit),
      credit: Number(course.credit)
    }
  })
  .reduce((sum,course) => {
    return {
      gpa : course.gpa + sum.gpa,
      credit : course.credit + sum.credit
    }
  }, { gpa: 0, credit: 0 })
}

const genJSON = () => {
  let db = JSON.stringify(courses, null, 2)
  fs.writeFileSync('myCourses.json', db)
}


/// get all course ! 
app.get("/courses", (req, res) => {
  res.json({ success: true, data: courses})
});

/// get course with specific id 
app.get("/courses/:id", (req, res) => {
  const course = courses.courses.find( course => course.courseId == req.params.id)
  const resOBJ = {successa: true, data: course }
  if(course != null) {
    res.status(200).json(resOBJ)
  }else {
    res.status(404).json({ success: false, data: null})
  }
});

// delete course by specific ID

// app.delete("/courses/:id", (req, res) => {
//   let size = courses.courses.length
//   console.log("size of original" + size)
//   let remainingCourse  = courses.courses.filter(course => courses.courseId != req.params.id)
//   console.log("size after delete" + remainingCourse)
//   if(remainingCourse.length < size){
//     sync()
//     res.status(200).json({ success: true, data: remainingCourse})
//   }else{

//     res.status(404).json({ success: false, data:remainingCourse})
//   }
// })
app.delete("/courses/:id", (req, res) => {
  let size = courses.courses.length
  courseRemain = courses.courses.filter(course => course.courseId != req.params.id)
  if (courseRemain.length < size) {
    sync()
    res.status(200).json({ success: true, data: courseRemain })
  }
  else {
    res.status(404).json({ success: false, data: courseRemain })
  }
})

//// add course 
app.post("/addCourse", (req, res) => {
  console.log(req.body)
  const { courseId, courseName, credit, gpa } = req.body
  if (courseId !== undefined && courseName !== undefined &&credit !== undefined && gpa !== undefined) {
    const addedCourse = {
      courseId: courseId,
      courseName: courseName,
      credit: credit,
      gpa: gpa
    }
    courses.courses.push(addedCourse)
    sync()
    res.status(201).send({ success: true, data: addedCourse })
  }else {
    res.status(422).send({ success: false, error: "check your input data" })
  }
})



// app.get("/phird", (req, res) => {
//   res.json({ phird: "Here"})
// });



const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));
