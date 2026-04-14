import { useState } from "react";

function ChatBox({ socket, roomId, messages, setMessages, userName }) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    socket.emit("send_message", {
      roomId,
      message: trimmed,
    });

    setMessages((prev) => [...prev, { text: trimmed, sender: userName || "You", self: true }]);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="panel chat-panel">
      <div className="panel-heading">
        <h3>Chat</h3>
        <span>{messages.length}</span>
      </div>

      <div className="chat-stream">
        {messages.length === 0 ? (
          <p className="empty-state">No messages yet. Say hello.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.self ? "mine" : "theirs"}`}>
              <span>{msg.self ? "You" : msg.sender || "Peer"}</span>
              <p>{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <textarea
        className="chat-input"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />

      <button className="send-button" onClick={sendMessage} type="button">
        Send
      </button>
    </div>
  );
}

export default ChatBox;