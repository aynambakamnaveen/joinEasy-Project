import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import groupRoutes from "./routes/group.route.js";
import assignmentRoutes from "./routes/assignment.route.js";
import userRoutes from "./routes/user.route.js";
import connectDB from "./config/db.js";
import {startAssignmentClosingJob} from './jobs/checkingAssignment.js'
connectDB();
const port = process.env.PORT || 3000;
const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Replace with your frontend URL
};
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", userRoutes);
app.use("/api", groupRoutes);
app.use("/api", assignmentRoutes);

startAssignmentClosingJob();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
