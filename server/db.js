// Simple in-memory room registry. Removes any SQL/storage and password logic.
const rooms = new Map();

function createRoom(roomId) {
  return new Promise((resolve) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        roomId,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      });
    }

    resolve({ roomId, isPrivate: false });
  });
}

function verifyRoomPassword(roomId /*, password */) {
  return new Promise((resolve) => {
    const exists = rooms.has(roomId);
    // Passwords are not used; always return valid if room exists
    resolve({ valid: exists, exists });
  });
}

function getRoomInfo(roomId) {
  return new Promise((resolve) => {
    const room = rooms.get(roomId) || null;
    resolve(room);
  });
}

function roomExists(roomId) {
  return new Promise((resolve) => {
    resolve(rooms.has(roomId));
  });
}

module.exports = {
  createRoom,
  verifyRoomPassword,
  getRoomInfo,
  roomExists,
};
