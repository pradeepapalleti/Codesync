import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [roomIsPrivate, setRoomIsPrivate] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(false);
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
        roomPassword: isPrivate ? createPassword : undefined,
      },
    });
  };

  const joinRoom = async () => {
    const trimmedRoomId = roomId.trim().toUpperCase();

    if (!trimmedRoomId) {
      setFeedback("Enter a room code first.");
      return;
    }

    setCheckingRoom(true);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${trimmedRoomId}`);
      const data = await res.json();

      if (!data.exists) {
        setFeedback("Room does not exist.");
        setCheckingRoom(false);
        return;
      }

      // If room is private and no password yet, show password field and wait
      if (data.isPrivate && !joinPassword.trim()) {
        setRoomIsPrivate(true);
        setFeedback("This room is private. Enter the password.");
        setCheckingRoom(false);
        return;
      }

      // If room is private, verify password
      if (data.isPrivate) {
        const verifyRes = await fetch("http://localhost:5000/api/rooms/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: trimmedRoomId, password: joinPassword }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.valid) {
          setFeedback("Wrong password.");
          setCheckingRoom(false);
          return;
        }
      }

      // Password is valid or room is public, proceed to join
      setRoomIsPrivate(false);
      setFeedback("");
      const userName = saveIdentity();
      navigate(`/editor/${trimmedRoomId}`, {
        state: {
          userName,
          roomPassword: joinPassword || undefined,
        },
      });
    } catch (err) {
      console.error("Error joining room:", err);
      setFeedback("Error checking room.");
    } finally {
      setCheckingRoom(false);
    }
  };

  const createRoom = async () => {
    if (isPrivate && !createPassword.trim()) {
      setFeedback("Set a password for your private room.");
      return;
    }

    const roomCode = createRoomCode();

    try {
      const res = await fetch("http://localhost:5000/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomCode,
          isPrivate,
          password: isPrivate ? createPassword : undefined,
        }),
      });

      if (!res.ok) {
        setFeedback("Error creating room.");
        return;
      }

      const userName = saveIdentity();
      navigate(`/editor/${roomCode}`, {
        state: {
          userName,
          roomPassword: createPassword || undefined,
        },
      });
    } catch (err) {
      console.error("Error creating room:", err);
      setFeedback("Error creating room.");
    }
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
            <input
              id="privateCheckbox"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => {
                setIsPrivate(e.target.checked);
                setCreatePassword("");
              }}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="privateCheckbox" style={{ cursor: "pointer", margin: 0 }}>
              Make room private
            </label>
          </div>

          {isPrivate && (
            <>
              <label className="field-label" htmlFor="createPassword">
                Room password
              </label>
              <input
                id="createPassword"
                type="password"
                placeholder="Enter password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </>
          )}

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

          {roomIsPrivate && (
            <>
              <label className="field-label" htmlFor="joinPassword">
                Room password
              </label>
              <input
                id="joinPassword"
                type="password"
                placeholder="Enter password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
              />
            </>
          )}

          <label className="field-label" htmlFor="joinName">
            Display name
          </label>
          <input
            id="joinName"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button type="button" onClick={joinRoom} disabled={checkingRoom}>
            {checkingRoom ? "Checking..." : "Join room"}
          </button>
          {feedback ? <p className="form-feedback">{feedback}</p> : null}
        </section>
      </div>
    </div>
  );
}

export default Home;