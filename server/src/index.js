import dotenv from "dotenv";
import { app } from "./app.js";
import { databse_connection_infrastructure, redisClient } from "./db/index.js";
import http from "http";
import { Server } from "socket.io";
import { startCleanupTask } from "./utils/cleanup.js";

dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// By "setting" the "io" instance into Express, we can access it inside our Controllers using req.app.get("io").
app.set("io", io);

// IO Connection Logic
io.on("connection", (socket) => {
  // console.log("user trying to connect 1")
  socket.on("join_kitchen", async ({ roomId, username }) => {
    // console.log("user trying to connect 2")
    try {
      if (!roomId || !username) {
        // console.log("Invalid join_kitchen payload:", { roomId, username });
        return;
      }

      socket.join(roomId);

      socket.roomId = roomId;
      socket.username = username;

      const onlineKey = `room:${roomId}:online`;

      await redisClient.sadd(onlineKey, username);
      await redisClient.expire(onlineKey, 86400);

      const onlineUsers = await redisClient.smembers(onlineKey);

      io.to(roomId).emit("online_users", onlineUsers);

      // console.log(`user join room ${username}`);
    } catch (error) {
      console.error("join_kitchen error:", error);
    }
  });

  socket.on("leave_kitchen",async ({ roomId: payloadRoom, username: payloadUser } = {}, ack) => {
      try {
        const roomId = socket.roomId || payloadRoom;
        const username = socket.username || payloadUser;

        if (!roomId || !username) {
          if (ack) ack({ success: false });
          return;
        }

        const onlineKey = `room:${roomId}:online`;

        await redisClient.srem(onlineKey, username);

        socket.leave(roomId);

        const onlineUsers = await redisClient.smembers(onlineKey);

        io.to(roomId).emit("online_users", onlineUsers);
        if (ack) ack({ success: true });
        // console.log(`user leave room ${username}`);
      } catch (error) {
        console.error("leave_kitchen error:", error);
      }
    },
  );

  socket.on("disconnecting", async () => {
    try {
      const { roomId, username } = socket;
      // console.log(`user disconnected from room ${username}`);

      if (!roomId || !username) return;

      const onlineKey = `room:${roomId}:online`;

      await redisClient.srem(onlineKey, username);

      const onlineUsers = await redisClient.smembers(onlineKey);

      io.to(roomId).emit("online_users", onlineUsers);
      // console.log(`user disconnected from room ${username}`);
    } catch (error) {
      console.error("disconnect error:", error);
    }
  });

  socket.on("dislike_recipe", ({ roomId }) => {
    if (!roomId) return;
    io.to(roomId).emit("recipe_cleared");
  });
});

databse_connection_infrastructure()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server & Socket running on port`);
    });
  })
  .catch((err) => {
    console.log("DB Connection failed:", err);
  });
