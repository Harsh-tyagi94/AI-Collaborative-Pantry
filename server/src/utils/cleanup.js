import cron from "node-cron";
import { Room } from "../models/room.model.js";
import { redisClient } from "../db/index.js";

const startCleanupTask = () => {
    // This runs every day at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
        console.log("Running daily Kitchen cleanup...");
        try {
            // 1. Find rooms that have been 'Active' for more than 15 hours
            const twentyFourHoursAgo = new Date(Date.now() - 15 * 60 * 60 * 1000);
            
            const staleRooms = await Room.find({
                isActive: true,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            for (const room of staleRooms) {
                const { roomId } = room;

                // 2. Archive whatever members were there
                const membersKey = `room:${roomId}:online`;
                const members = await redisClient.smembers(membersKey);
                
                room.members = members;
                room.isActive = false;
                await room.save();

                // 3. Wipe Redis keys
                await redisClient.del(
                    `room:${roomId}:pantry`, 
                    `room:${roomId}:online`
                );
            }
        } catch (error) {
            console.error("Cleanup Task Error:", error);
        }
    });
};

export { startCleanupTask }