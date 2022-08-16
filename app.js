if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const homeRoutes = require('./routes/home');
const businessOwnerRoutes = require('./routes/signUp/businessOwner');

// const dbUrl = 'mongodb://localhost:27017/aseedo';     // For development
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/aseedo'


main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
  console.log("DATABASE CONNECTED!!");
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static(__dirname + '/public'));



app.use('/', homeRoutes);
app.use('/signup/businessowner', businessOwnerRoutes);
app.use('*', (req, res) => {
  res.send("Page Not Found!!")
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`SERVER STARTED AT PORT ${PORT}`);
})