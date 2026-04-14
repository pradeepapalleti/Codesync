import { useParams } from "react-router-dom";
import { useState } from "react";
import CodeEditor from "../components/CodeEditor";

function EditorPage() {
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding...");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Room: {roomId}</h2>

      <CodeEditor defaultLanguage="cpp" code={code} setCode={setCode} />
    </div>
  );
}

export default EditorPage;