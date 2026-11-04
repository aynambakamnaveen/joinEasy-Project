import express from 'express';

import protect from "../middlewares/protect.js";
import authorize from "../middlewares/role.js";

import {
  submissionController,
  changeSubmission,
  getSubmissionsByGroups,
} from "../controllers/submission.control.js";

const router = express.Router();

router.post(
    "/createSubmission/:groupId/:assignmentId",
    protect,
    authorize("student"),
    submissionController,
);

router.patch(
    "/submissionAccepted/:submissionId/:groupId",
    protect,
    authorize("teacher"),
    changeSubmission,
);

router.post(
    "/getSubmissionsByGroups",
    protect,
    authorize("teacher", "student"),
    getSubmissionsByGroups,
);

export default router;

