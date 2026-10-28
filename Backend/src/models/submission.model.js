import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    gitHubLink: {
      type: String,
      required: true,
    },
    liveLink: {
      type: String,
    },
    description: {
      type: String,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
    isConfirmedByUser: {
      type: Boolean,
      default: false,
    },
    isConfirmedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ assignment: 1, group: 1 }, { unique: true });
const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
