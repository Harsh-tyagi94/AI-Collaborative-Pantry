import cron from "node-cron";
import { Room } from "../models/room.model.js";
import { redisClient } from "../db/index.js";

const startCleanupTask = async () => {
  console.log("Running Kitchen cleanup...");

  try {
    // 10 hours ago
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

    // Find stale rooms
    const staleRooms = await Room.find({
      isActive: true,
      createdAt: { $lt: tenHoursAgo },
    });

    for (const room of staleRooms) {
      const { roomId } = room;

      // Archive members
      const membersKey = `room:${roomId}:online`;
      const members = await redisClient.smembers(membersKey);

      room.members = members;
      room.isActive = false;
      await room.save();

      // Delete Redis keys
      await redisClient.del(`room:${roomId}:pantry`, `room:${roomId}:online`);

      console.log(`Room ${roomId} marked inactive and cleaned.`);
    }
  } catch (error) {
    console.error("Cleanup Task Error:", error);
  }
};

export { startCleanupTask };
