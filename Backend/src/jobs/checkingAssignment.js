import cron from "node-cron";
import Assignment from "../models/assignment.model.js";

async function closeExpiredAssignments() {
    try {
        const now = new Date();

        // Find assignments whose deadlines have passed
        const expiredAssignments = await Assignment.find({
        dueDate: { $lte: now },
        isClosed: false,
        }).populate("assignedGroups");

        for (const assignment of expiredAssignments) {
        assignment.isClosed = true;
        // Check whether all groups have submitted and been accepted
        const allGroupsCompleted =
            assignment.assignedGroups.length > 0 &&
            assignment.assignedGroups.every(
                (group) => group.isSubmitted && group.accepted,
            );
        if (allGroupsCompleted) {
            assignment.isCompleted = true;
        }
        await assignment.save();
        }
        console.log(`Processed ${expiredAssignments.length} expired assignments`);
    } catch (error) {
        console.error("Failed to close assignments:", error);
    }
}

export function startAssignmentClosingJob() {
  // Check immediately when the server starts
    void closeExpiredAssignments();

    // Check every 5 minutes
    cron.schedule("*/10 * * * *", async () => {
        console.log("Assignment closing job started:", new Date());

        await closeExpiredAssignments();
    });
}
