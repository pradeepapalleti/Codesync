import { useState } from "react";

function ChatBox({ socket, roomId , messages, setMessages }) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message) return;

    socket.emit("send_message", {
      roomId,
      message,
    });

    setMessages((prev) => [...prev, { text: message, self: true }]);
    setMessage("");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Chat</h3>

      <div
        style={{
          height: "150px",
          overflowY: "scroll",
          border: "1px solid gray",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.self ? "You: " : "User: "} {msg.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Type message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;