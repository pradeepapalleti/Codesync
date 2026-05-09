const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const { createRoom, getRoomInfo, roomExists } = require("./db");

const rooms = new Map();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

function getRoomUsers(roomId) {
  const room = rooms.get(roomId);

  if (!room) {
    return [];
  }

  return Array.from(room.users.values());
}

function removeSocketFromRoom(socket, roomId) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  room.users.delete(socket.id);

  if (room.users.size === 0) {
    rooms.delete(roomId);
  }

  socket.to(roomId).emit("user_list", getRoomUsers(roomId));
}

function isSocketInRoom(socket, roomId) {
  const room = rooms.get(roomId);

  if (!room || !room.users.has(socket.id)) {
    return false;
  }

  return socket.data.roomId === roomId;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join_room", (payload) => {
    const roomId = typeof payload === "string" ? payload : payload?.roomId;
    const incomingName = typeof payload === "object" ? payload?.userName : "";
    const userName = typeof incomingName === "string" && incomingName.trim()
      ? incomingName.trim()
      : `Guest ${socket.id.slice(0, 4)}`;

    if (!roomId) {
      return;
    }

    let room = rooms.get(roomId);

    if (!room) {
      room = {
        users: new Map(),
      };

      rooms.set(roomId, room);
    }

    if (socket.data.roomId && socket.data.roomId !== roomId) {
      removeSocketFromRoom(socket, socket.data.roomId);
      socket.leave(socket.data.roomId);
    }

    room.users.set(socket.id, userName);

    socket.data.roomId = roomId;
    socket.data.userName = userName;

    socket.join(roomId);
    io.to(roomId).emit("user_list", getRoomUsers(roomId));
  });

  socket.on("disconnect", () => {
    if (socket.data.roomId) {
      removeSocketFromRoom(socket, socket.data.roomId);
    }

    console.log("User disconnected:", socket.id);
  });

  // Code change event
  socket.on("code_change", ({ roomId, code }) => {
    if (!isSocketInRoom(socket, roomId)) {
      return;
    }

    socket.to(roomId).emit("code_update", code);
  });

  socket.on("output_change", ({ roomId, output }) => {
    if (!isSocketInRoom(socket, roomId)) {
      return;
    }

    socket.to(roomId).emit("output_update", output);
  });

  socket.on("language_change", ({ roomId, languageId }) => {
    if (!isSocketInRoom(socket, roomId)) {
      return;
    }

    socket.to(roomId).emit("language_update", languageId);
  });

  socket.on("send_message", ({ roomId, message }) => {
    if (!isSocketInRoom(socket, roomId)) {
      return;
    }

    const senderName = socket.data.userName || `Guest ${socket.id.slice(0, 4)}`;

    socket.to(roomId).emit("receive_message", {
      text: message,
      sender: senderName,
      selfId: socket.id,
    });
  });
});

// REST API endpoints

app.post("/api/rooms/create", async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "Room ID required" });
    }

    const result = await createRoom(roomId);
    res.json(result);
  } catch (err) {
    console.error("Create room error:", err);
    res.status(500).json({ error: "Error creating room" });
  }
});

app.get("/api/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await getRoomInfo(roomId);

    if (!room) {
      return res.json({ exists: false, isPrivate: false });
    }

    res.json({ exists: true, isPrivate: room.isPrivate });
  } catch (err) {
    console.error("Get room error:", err);
    res.status(500).json({ error: "Error getting room info" });
  }
});

// Password verification endpoint removed — passwords are not used anymore.

// Code execution endpoint

app.post("/run", async (req, res) => {
  const { code, languageId } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ output: "Code is required" });
  }

  const selectedLanguageId = Number(languageId) || 63;

  try {
    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: selectedLanguageId,
      }
    );
    const result = response.data;

    res.json({
      output:
        result.stdout ||
        result.stderr ||
        result.compile_output ||
        result.message ||
        (result.status && result.status.description) ||
        "No output",
    });
  } catch (error) {
    console.error("Run error:", error.message);

    res.json({ output: "Error running code" });
  }
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
