import express from "express";
import multer from "multer";
import {
  createGroup,
  getMyGroup,
  addMember,
  getTeacherGroups,
  AssignTask,
  sendAlertMail,
} from "../controllers/group.controll.js";

import protect from "../middlewares/protect.js";
import authorize from "../middlewares/role.js";
const upload = multer()
const router = express.Router();

router.post("/createGroup", protect, authorize("teacher"),upload.none(), createGroup);


router.get("/getTeacherGroups", protect, authorize("teacher"), getTeacherGroups)

router.get("/myGroup", protect, authorize("student", "teacher"), getMyGroup);

router.post("/:groupId/members", protect, authorize("teacher"), addMember);

router.patch("/assign/:groupId", protect, authorize("teacher"), AssignTask);

router.post("/sendAlertMail", protect, authorize("teacher"), sendAlertMail);

export default router;
