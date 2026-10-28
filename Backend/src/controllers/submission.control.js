import submission from "../models/submission.model.js";
import Group from "../models/group.model.js";
export const submissionController = async (req, res) => {
  try {
    const { gitHubLink, liveLink, description } = req.body;

    const { groupId, assignmentId } = req.params;

    // Validate IDs
    if (!groupId || !assignmentId) {
      return res.status(400).json({
        message: "Group ID and Assignment ID are required",
      });
    }

    // GitHub link required
    if (!gitHubLink) {
      return res.status(400).json({
        message: "GitHub link is required",
      });
    }

    // Find group and make sure it belongs to this assignment
    const group = await Group.findOne({
      _id: groupId,
      assignment: assignmentId,
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found for this assignment",
      });
    }

    // Only leader can submit
    if (group.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the group leader can submit",
      });
    }

    // Check if already submitted
    const existingSubmission = await submission.findOne({
      group: groupId,
      assignment: assignmentId,
    });

    if (existingSubmission) {
      return res.status(409).json({
        message: "Assignment has already been submitted",
      });
    }

    // Create submission
    const newSubmission = await submission.create({
      assignment: assignmentId,
      group: groupId,
      submittedBy: req.user._id,
      gitHubLink,
      liveLink,
      description,
      isConfirmedByUser: true,
      isConfirmedByAdmin: false,
    });
    group.isSubmitted = true;
    await group.save();

    return res.status(201).json({
      message: "Submission created successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create submission",
    });
  }
};

export const changeSubmission = async (req, res) => {
  try {
    const { isConfirmedByAdminSent } = req.body;
    const { submissionId,groupId } = req.params;

    const group = await Group.findOneAndUpdate({_id: groupId}, {
      $set : {
        accepted : true
      }
    }, {new : true});

    if (!group) {
      return res.status(404).json({
        message: "Group Not Found"
      })
    }
    
    const findSub = await submission.findOneAndUpdate(
      { _id: submissionId },
      { $set: { isConfirmedByAdmin: isConfirmedByAdminSent } },
      { new: true, runValidators: true },
    );

    if (!findSub) {
      return res.status(404).json({
        message: "Submission Not Found",
      });
    }

    return res.status(200).json({
      message: "Submission Updated Successfully",
      submission: findSub,
    });
  } catch (error) {
    console.error("Error updating submission:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSubmissionsByGroups = async (req, res) => {
  try {
    const { groupIds } = req.body;

    if (groupIds.length === 0) {
      return res.status(200).json({
        message: "Submissions Not Found",
      });
    }

    const submissions = await submission.find({
      group: { $in: groupIds },
    });

    return res.status(200).json({
      message: submissions.length
        ? "Submissions fetched successfully"
        : "No submissions found for these groups",
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};