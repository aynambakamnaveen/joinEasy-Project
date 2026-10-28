import Group from "../models/group.model.js";
import Submission from "../models/submission.model.js";
import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
//Creates group by teacher
import { transporter } from "../services/email.service.js";
export const createGroup = async (req, res) => {
  try {
    const rawMembers = req.body.members;

    let members;

    try {
      members =
        typeof rawMembers === "string" ? JSON.parse(rawMembers) : rawMembers;
    } catch {
      return res.status(400).json({
        message: "Members must be a valid JSON array",
      });
    }

    const { name, leader, assignment } = req.body;
    const assignTask = req.body.AssignTask === "true";

    if (!assignment) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        message: "At least one member is required",
      });
    }

    if (!leader) {
      return res.status(400).json({
        message: "Leader is required",
      });
    }

    if (!members.every((member) => typeof member === "string")) {
      return res.status(400).json({
        message: "Every member must be a username",
      });
    }

    // Normalize usernames
    const memberUsernames = members.map((username) => username.trim());

    if (memberUsernames.some((username) => !username)) {
      return res.status(400).json({
        message: "Member usernames cannot be empty",
      });
    }

    // Check duplicate usernames
    const uniqueUsernames = [...new Set(memberUsernames)];

    if (uniqueUsernames.length !== memberUsernames.length) {
      return res.status(400).json({
        message: "Duplicate members are not allowed",
      });
    }

    // Check assignment exists
    const assignmentExists = await Assignment.findById(assignment);

    if (!assignmentExists) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }
    if (assignmentExists.groups.length > 5) {
      return res.status(400).json({
        message: "Max 5 groups can be created at each assignment",
      });
    }
    // Find users
    const users = await User.find({
      username: { $in: uniqueUsernames },
    }).select("_id username role");

    if (users.length !== uniqueUsernames.length) {
      const foundUsernames = new Set(users.map((user) => user.username));

      const missingUsernames = uniqueUsernames.filter(
        (username) => !foundUsernames.has(username),
      );

      return res.status(404).json({
        message: "Some students were not found",
        users: missingUsernames,
      });
    }

    // Prevent teachers from joining groups
    const teacher = users.find((user) => user.role === "teacher");

    if (teacher) {
      return res.status(400).json({
        message: `${teacher.username} is a teacher and cannot be added to a group`,
      });
    }

    // Verify leader belongs to the group
    const leaderUser = users.find((user) => user.username === leader);

    if (!leaderUser) {
      return res.status(400).json({
        message: "Leader must be one of the group members",
      });
    }

    // Convert usernames to MongoDB ObjectIds
    const memberIds = users.map((user) => user._id);
    const leaderId = leaderUser._id;

    // Prevent students from joining multiple groups
    // for the same assignment
    const existingGroup = await Group.findOne({
      assignment,
      members: { $in: memberIds },
    });

    if (existingGroup) {
      return res.status(409).json({
        message:
          "One or more students already belong to a group for this assignment",
      });
    }

    // Create group
    const group = await Group.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: memberIds,
      assignment,
      leader: leaderId,
      AssignTask: assignTask,
    });

    const update = {
      $addToSet: {
        groups: group._id,
      },
    };

    if (assignTask) {
      update.$addToSet.assignedGroups = group._id;
    }

    await Assignment.updateOne({ _id: assignment }, update);

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      message: "Failed to create group",
    });
  }
};

//Get the group of the logged-in student
export const getMyGroup = async (req, res) => {
  try {
    const group = await Group.find({
      members: req.user._id,
    })
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({
        message: "You are not part of any group",
      });
    }

    res.status(200).json({
      group,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch group",
    });
  }
};

//Used to add a member to the group by the admin
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Student username is required",
      });
    }

    // Find group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Find student
    const student = await User.findOne({
      username,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Already in this group?
    const alreadyMember = group.members.some(
      (member) => member.toString() === student._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "Student is already in this group",
      });
    }

    // Already in another group for same assignment?
    const existingGroup = await Group.findOne({
      assignment: group.assignment,
      members: student._id,
      _id: { $ne: group._id },
    });

    if (existingGroup) {
      return res.status(409).json({
        message: "Student already belongs to another group for this assignment",
      });
    }

    // Add student
    group.members.push(student._id);

    await group.save();

    return res.status(200).json({
      message: "Student added successfully",
      group,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add student",
    });
  }
};

//Get groups of logged-In teacher
export const getTeacherGroups = async (req, res) => {
  try {
    const group = await Group.find({
      createdBy: req.user._id,
    });
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }
    res.status(200).json({
      group,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch group",
    });
  }
};
//Delete Group by the admin
export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const assignmentId = req.params.assignmentId;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    await Group.findByIdAndDelete(groupId);

    await Submission.findOneAndDelete({
      group: groupId,
      assignment: assignmentId,
    });
    res.status(200).json({
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete group",
    });
  }
};

export const AssignTask = async (req, res) => {
  const { assignTask } = req.body;
  const groupId = req.params.groupId;
  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      {
        $set: { assignTask: assignTask },
      },
      { new: true },
    );
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }
    res.status(200).json({
      message: "Task assiged successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

//Sending mail alert
// Escape user input so it can't inject HTML into the email
const esc = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildHTML = ({ teacherName, message, formattedDueDate }) => `
<div style="background:#f4f5f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:10px;
                border-top:5px solid #4f46e5;">
    <tr>
      <td style="padding:28px 28px 8px;">
        <h2 style="margin:0;color:#111827;font-size:22px;">⏰ Assignment Reminder</h2>
        <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">
          From <strong style="color:#374151;">${esc(teacherName)}</strong>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 28px;">
        <div style="background:#eef2ff;border-radius:8px;padding:14px 16px;">
          <div style="font-size:12px;color:#6366f1;font-weight:bold;letter-spacing:1px;">DUE DATE</div>
          <div style="font-size:20px;color:#111827;font-weight:bold;padding-top:4px;">
            ${esc(formattedDueDate)}
          </div>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding:0 28px 24px;color:#374151;font-size:15px;line-height:1.6;">
        ${esc(message || "Please complete your assignment before the deadline.").replace(/\n/g, "<br/>")}
      </td>
    </tr>

    <tr>
      <td style="padding:16px 28px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
        Sent via JoinEasy on behalf of ${esc(teacherName)}
      </td>
    </tr>
  </table>
</div>`;

export const sendAlertMail = async (req, res) => {
  const { email, message, teacherName, dueDate } = req.body;

  try {
    if (!email || !teacherName || !dueDate) {
      return res.status(400).json({
        message: "Email, teacher name, and due date are required",
      });
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    const formattedDueDate = due.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const info = await transporter.sendMail({
      from: `"JoinEasy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Assignment Reminder: due ${formattedDueDate}`,
      text: `Hello,

This is a reminder from ${teacherName} to submit your assignment before ${formattedDueDate}.

${message || "Please complete your assignment before the deadline."}

Regards,
${teacherName}
JoinEasy`,
      html: buildHTML({ teacherName, message, formattedDueDate }),
    });

    return res.status(200).json({
      message: "Assignment reminder email sent successfully",
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("Error while sending reminder email:", err);

    return res.status(500).json({
      message: "Failed to send assignment reminder",
    });
  }
};
