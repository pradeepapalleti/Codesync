import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = window.localStorage.getItem("codesync_user_name");

    if (savedName) {
      setDisplayName(savedName);
      return;
    }

    const generatedName = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
    setDisplayName(generatedName);
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 1800);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const saveIdentity = () => {
    const trimmedName = displayName.trim() || `Guest ${Math.floor(1000 + Math.random() * 9000)}`;

    window.localStorage.setItem("codesync_user_name", trimmedName);
    setDisplayName(trimmedName);

    return trimmedName;
  };

  const createRoomCode = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  };

  const goToEditor = (targetRoomId) => {
    const userName = saveIdentity();

    navigate(`/editor/${targetRoomId}`, {
      state: {
        userName,
      },
    });
  };

  const joinRoom = () => {
    const trimmedRoomId = roomId.trim().toUpperCase();

    if (!trimmedRoomId) {
      setFeedback("Enter a room code first.");
      return;
    }
    goToEditor(trimmedRoomId);
  };

  const createRoom = () => {
    const roomCode = createRoomCode();

    goToEditor(roomCode);
  };

  return (
    <div className="home-shell">
      <div className="home-hero">
        <p className="eyebrow">Collaborative coding</p>
        <h1>Code together without friction.</h1>
        <p className="hero-copy">
          Create a room or join one instantly, then keep your display name in sync while you work.
        </p>
      </div>

      <div className="home-grid">
        <section className="card home-card">
          <div className="card-badge">Create</div>
          <h2>Create a new room</h2>
          <p>Generate a fresh room code and jump straight into the editor.</p>

          <label className="field-label" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button type="button" onClick={createRoom}>
            Create room
          </button>
        </section>

        <section className="card home-card">
          <div className="card-badge card-badge-alt">Join</div>
          <h2>Join with a code</h2>
          <p>Enter the room code shared by someone else and join that workspace.</p>

          <label className="field-label" htmlFor="roomId">
            Room code
          </label>
          <input
            id="roomId"
            placeholder="Enter room code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <label className="field-label" htmlFor="joinName">
            Display name
          </label>
          <input
            id="joinName"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button type="button" onClick={joinRoom}>
            Join room
          </button>
          {feedback ? <p className="form-feedback">{feedback}</p> : null}
        </section>
      </div>
    </div>
  );
}

export default Home;