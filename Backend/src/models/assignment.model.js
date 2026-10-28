import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          if (value == null) return true;

          return value > new Date();
        },

        message: "Due date must be in the future.",
      },
    },

    oneDriveLink: {
      type: String,
      trim: true,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedToAll: {
      type: Boolean,
      default: false,
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    assignedGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
assignmentSchema.index({
  createdBy:1
});
const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
