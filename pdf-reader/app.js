const express = require("express");
const app = express();
const usersRoute = require("./routes/users.js");
const adminsRoute = require("./routes/admins.js");
const multer = require("multer");
const cors = require("cors");


app.use(cors());

const array = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", usersRoute);
app.use("/admin", adminsRoute);

app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage });


app.post("/upload", upload.single("avatar"), (req, res) => {
  var originalFileName = req.file.originalname;
  console.log(originalFileName);
  array.push(originalFileName);
  return res.json({ status: "OK", file: array[0] });
});



app.listen(3000);
