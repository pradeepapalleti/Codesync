import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import { io } from "socket.io-client";

// connect to backend
const socket = io("http://localhost:5000");

function EditorPage() {
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding...");

  // Join room
  useEffect(() => {
    socket.emit("join_room", roomId);
  }, [roomId]);

  // Receive updates
  useEffect(() => {
    socket.on("code_update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code_update");
    };
  }, []);

  // Send updates
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    socket.emit("code_change", {
      roomId,
      code: newCode,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Room: {roomId}</h2>

      <CodeEditor code={code} setCode={handleCodeChange} />
    </div>
  );
}

export default EditorPage;