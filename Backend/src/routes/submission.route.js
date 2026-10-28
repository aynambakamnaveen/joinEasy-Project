import express from 'express';

import protect from "../middlewares/protect.js";
import authorize from "../middlewares/role.js";

import {submissionController, changeSubmission} from '../controllers/submission.control.js'

const router = express.Router();

router.post(
    "/createSubmission",
    protect,
    authorize("teacher"),
    submissionController,
);

router.patch(
    "/submissionDone/:submissionId",
    protect,
    authorize("teacher"),
    changeSubmission,
);

