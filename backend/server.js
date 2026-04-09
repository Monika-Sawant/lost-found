const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const itemRoutes = require("../routes/itemRoutes");

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Lost & Found API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



/*let express =require("express");
let app=express();

app.use(express.json()); //middleware

app.get("/",(req,res)=>{
    res.send("Backend is Running");
});

let port=3000;
app.listen(port,()=>{
    console.log("App listening or server running on port ",port);
});

//run http://localhost:3000/ in browser*/


