import cron from "node-cron";
import Assignment from "../models/assignment.model.js";

async function closeExpiredAssignments() {
    try {
        const now = new Date();

        const result = await Assignment.updateMany(
        {
            dueDate: { $lte: now },
            isClosed: false,
        },
        {
            $set: { isClosed: true },
        },
        );

        if (result.modifiedCount > 0) {
        console.log(`Closed ${result.modifiedCount} expired assignments`);
        }
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
