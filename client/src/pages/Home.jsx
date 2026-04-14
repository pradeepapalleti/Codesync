import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!roomId) {
        alert("Enter Room ID");
        return;
    }
    navigate(`/editor/${roomId}`);

  };
  

  return (
    <div className="container">
      <div className="card">
        <h2>CodeSync 🚀</h2>
        <p>Join a coding room</p>

        <input
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}

export default Home;