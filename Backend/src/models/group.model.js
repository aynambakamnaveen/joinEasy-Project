import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [ true, "At least one member is required"],
      },
    ],
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [ true, "Leader is required"],
    },
    AssignTask:{
      type: Boolean,
      default: false,
    },
    isSubmitted: {
      type: Boolean,
      default: false
    },
    accepted : {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  },
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
