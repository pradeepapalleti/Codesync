import { Link, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import ChatBox from "../components/ChatBox";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Editor() {
  const { roomId } = useParams();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState("// Start coding...");
  const [messages, setMessages] = useState([]);
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(63);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [copyState, setCopyState] = useState("Copy room id");
  const [lastRunAt, setLastRunAt] = useState("");
  const [userName, setUserName] = useState("");

  const languageLabel =
    language === 63 ? "JavaScript" : language === 54 ? "C++" : "Python";

  useEffect(() => {
    const routeName = typeof location.state?.userName === "string" ? location.state.userName : "";
    const savedName = window.localStorage.getItem("codesync_user_name");
    const fallbackName = `Guest ${socket.id ? socket.id.slice(0, 4) : "0000"}`;
    const nextName = routeName.trim() || (savedName && savedName.trim() ? savedName.trim() : fallbackName);

    setUserName(nextName);
    window.localStorage.setItem("codesync_user_name", nextName);
  }, [location.state]);

  // Join room
  useEffect(() => {
    if (!roomId || !userName) {
      return;
    }

    socket.emit("join_room", {
      roomId,
      userName,
    });
  }, [roomId, userName]);

  // Listen for updates
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("code_update", (newCode) => {
      setCode(newCode);
    });

    socket.on("language_update", (newLanguage) => {
      setLanguage(Number(newLanguage));
    });

    socket.on("output_update", (newOutput) => {
      setOutput(newOutput);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          text: message.text,
          sender: message.sender,
          self: message.selfId === socket.id,
        },
      ]);
    });

    socket.on("user_list", (userList) => {
      setUsers(userList);
    });

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("code_update");
      socket.off("language_update");
      socket.off("output_update");
      socket.off("receive_message");
      socket.off("user_list");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCopyState("Copy room id");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [copyState]);

  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    socket.emit("code_change", {
      roomId,
      code: newCode,
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);

    socket.emit("language_change", {
      roomId,
      languageId: newLanguage,
    });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopyState("Copied");
    } catch {
      setCopyState("Copy failed");
    }
  };

  // Run code
  const runCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput("Running code...");
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, languageId: language }),
      });

      const data = await res.json();
      setOutput(data.output);
      setLastRunAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      socket.emit("output_change", {
        roomId,
        output: data.output,
      });
    } catch (err) {
      setOutput("Error running code");
      socket.emit("output_change", {
        roomId,
        output: "Error running code",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-shell">
      <div className="editor-sidebar">
        <div className="brand-block">
          <Link to="/" className="brand-link" aria-label="Go to home">
            <span className="brand-mark" aria-hidden="true">CS</span>
            <span className="brand-wordmark">CodeSync</span>
          </Link>
        </div>

        <div className="panel meta-panel">
          <div className={`status-pill ${isConnected ? "status-on" : "status-off"}`}>
            <span className="status-dot" />
            {isConnected ? "Connected" : "Reconnecting"}
          </div>
          <div className="meta-row">
            <span className="label">You</span>
            <strong>{userName || "Guest"}</strong>
          </div>
          <div className="room-row">
            <div>
              <span className="label">Room</span>
              <h3>{roomId}</h3>
            </div>
            <button className="ghost-button" onClick={copyRoomId} type="button">
              {copyState}
            </button>
          </div>
          <div className="stats-grid">
            <div>
              <span className="label">Language</span>
              <strong>{languageLabel}</strong>
            </div>
            <div>
              <span className="label">Peers</span>
              <strong>{users.length}</strong>
            </div>
          </div>

        </div>
        <div className="panel users-panel">
          <div className="panel-heading">
            <h3>Active Users</h3>
            <span>{users.length}</span>
          </div>
          <div className="user-list">
            {users.length === 0 ? (
              <p className="empty-state">Waiting for collaborators to join.</p>
            ) : (
              users.map((u, i) => (
                <div key={`${u}-${i}`} className={`user-chip ${u === userName ? "mine" : ""}`}>
                  <span className="user-dot" />
                  {u}
                </div>
              ))
            )}
          </div>
        </div>

        <ChatBox
          socket={socket}
          roomId={roomId}
          messages={messages}
          setMessages={setMessages}
          userName={userName}
        />

        <div className="panel tips-panel">
          <span className="label">Shortcut</span>
          <p>Press Ctrl + Enter to run the current code.</p>
        </div>
      </div>

      <main className="editor-main">
        <div className="toolbar panel">
          <div>
            <span className="label">Language</span>
            <select
              className="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(Number(e.target.value))}
            >
              <option value={63}>JavaScript</option>
              <option value={54}>C++</option>
              <option value={71}>Python</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <button className="run-button" onClick={runCode} type="button" disabled={isRunning}>
              <span className="run-icon" aria-hidden="true">▶</span>
              <span>{isRunning ? "Running" : "Run Code"}</span>
            </button>
          </div>
        </div>

        <div className="panel editor-panel">
          <CodeEditor code={code} setCode={handleCodeChange} language={language} />
        </div>

        <div className="panel output-panel">
          <div className="panel-heading">
            <div>
              <h3>Output</h3>
              <span className="label">
                {lastRunAt ? `Last run at ${lastRunAt}` : "Run code to see results here"}
              </span>
            </div>
            <button className="ghost-button" type="button" onClick={() => setOutput("")}>Clear</button>
          </div>
          <pre className="output-box">{output || "Nothing yet. Run the code to inspect output."}</pre>
        </div>
      </main>
    </div>
  );
}

export default Editor;