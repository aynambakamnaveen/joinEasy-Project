import express from "express";
import { uploadFile } from "../middlewares/upload.js";

import {
  createAssignment,
  getAllAssignments,
  deleteAssignment,
  getAssignment,
  getUserAssignments,
  getTeacherAssignments,
} from "../controllers/assignment.controll.js";

import protect from "../middlewares/protect.js";
import authorize from "../middlewares/role.js";

const router = express.Router();

router.get("/assignment/:assignmentId", protect, authorize("teacher", "student"), getAssignment);
router.post("/createAssignment", protect, authorize("teacher"), uploadFile.single("file"), createAssignment);
router.get("/getTeacherAssignments", protect, authorize("teacher"), getTeacherAssignments);
router.get("/getUserAssignments", protect, authorize("student", 'teacher'), getUserAssignments);
router.get(
  "/getAllAssignments",
  protect,
  authorize("teacher", "student"),
  getAllAssignments,
);
router.delete("/:assignmentId", protect, authorize("teacher"), deleteAssignment);

export default router;
