import cron from "node-cron";
import { Room } from "../models/room.model.js";
import { redisClient } from "../db/index.js";

const startCleanupTask = () => {
    // This runs every day at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
        console.log("Running daily Kitchen cleanup...");

        try {
            // 1. Find rooms that have been 'Active' for more than 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const staleRooms = await Room.find({
                isActive: true,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            for (const room of staleRooms) {
                const { roomId } = room;

                // 2. Archive whatever members were there
                const membersKey = `room:members:${roomId}`;
                const members = await redisClient.smembers(membersKey);
                
                room.participants = members;
                room.isActive = false;
                await room.save();

                // 3. Wipe Redis keys
                await redisClient.del(
                    `pantry:${roomId}`, 
                    `room:members:${roomId}`, 
                    `room:online:${roomId}`
                );

                console.log(`Archived stale room: ${roomId}`);
            }
        } catch (error) {
            console.error("Cleanup Task Error:", error);
        }
    });
};

export { startCleanupTask }