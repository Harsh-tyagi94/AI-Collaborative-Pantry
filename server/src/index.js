import dotenv from "dotenv"
import { app } from "./app.js";
import { databse_connection_infrastructure } from "./db/index.js";
import http from "http"
import { Server } from "socket.io"
import { startCleanupTask } from "./utils/cleanup.js";

dotenv.config({
    path: "./.env"
})
const port = process.env.PORT || 8000
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

// By "setting" the "io" instance into Express, we can access it inside our Controllers using req.app.get("io").
app.set("io", io);

// IO Connection Logic
io.on("connection", (socket) => {
    
    socket.on("join_kitchen", ({ roomId, username }) => {
        socket.join(roomId);
        socket.username = username; // Attach username to the socket object
        socket.roomId = roomId;

        // Broadcast that User X is 'Online'
        io.to(roomId).emit("user_online", { username });
    });

    socket.on("disconnect", async () => {
        const { roomId, username } = socket;
        
        if (roomId && username) {
            const onlineKey = `room:online:${roomId}`;
            // Remove from ONLINE list only
            await redisClient.srem(onlineKey, username);
            
            // Tell everyone else User X left the building
            io.to(roomId).emit("user_offline", { username });
        }
    });
});

databse_connection_infrastructure()
.then(() => {
    startCleanupTask()
    server.listen(port, () => {
        console.log(`Server & Socket running on port: ${port}`);
    });
})
.catch((err) => {
    console.log("DB Connection failed:", err);
});