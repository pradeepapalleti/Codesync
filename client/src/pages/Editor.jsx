import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import ChatBox from "../components/ChatBox";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Editor() {
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding...");
  const [messages, setMessages] = useState([]);

  // Join room
  useEffect(() => {
    socket.emit("join_room", roomId);
  }, [roomId]);

  // Code updates
  useEffect(() => {
    socket.on("code_update", (newCode) => {
      setCode(newCode);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, { text: message, self: false }]);
    });

    return () => {
      socket.off("code_update");
      socket.off("receive_message");
    };
  }, []);

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

      <ChatBox
        socket={socket}
        roomId={roomId}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
}

export default Editor;