import Assignment from "../models/assignment.model.js";
import Group from "../models/group.model.js";
import {uploadFile} from "../middlewares/upload.js"
import imagekit from "../services/storage.service.js";
//Create assignment
export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      oneDriveLink,
      assignedToAll
    } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    let fileUrl = null;
    let fileId = null;

    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: req.file.originalname,
        folder: "/assignments",
        useUniqueFileName: true,
      });

      fileUrl = result.url;
      fileId = result.fileId;
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      oneDriveLink,

      // req.user comes from protect middleware
      createdBy: req.user._id,

      assignedToAll: assignedToAll || false,
      fileUrl: fileUrl,
      fileId: fileId,
      // If all groups, don't need specific group IDs
      assignedGroups:[],
      groups: []
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create assignment",
    });
  }
};

//Get required assignment
export const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      createdBy: req.user._id,
    })
      .populate("assignedGroups")
      .populate({
        path: "groups",
        populate: {
          path: "members",
          select: "_id username ProfileImage email",
        },
      })
      .lean();
    res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch teacher assignments",
    });
  }
}
export const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const groups = await Group.find({
      assignment: assignmentId,
    })
      .populate("members", "username name email")
      .populate("leader", "username name email");

    return res.status(200).json({
      assignment,
      groups,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server side error, Please try later",
    });
  }
};
//Get user assignments
export const getUserAssignments = async (req, res) => {
  try {
    // Find groups where the logged-in user is a member
    const groups = await Group.find({
      members: req.user._id,
    }).select("assignment");

    // Get assignment IDs from those groups
    const assignmentIds = groups.map((group) => group.assignment);

    // Find assignments belonging to those groups
    const assignments = await Assignment.find({
      _id: { $in: assignmentIds },
    }).populate("createdBy", "username name email");
    console.log(assignments)
    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch user assignments",
    });
  }
};
//Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("createdBy", "name email")
      .populate("assignedGroups", "name");

    res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const ass = await Assignment.findByIdAndDelete(assignmentId);

    if (!ass) {
      return res.status(404).json({
        message: "Assignment is not available",
      });
    }

    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server side error, Please try later",
    });
  }
};