import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode, language }) {
  return (
    <Editor
      height="100%"
      language={
        language === 63
          ? "javascript"
          : language === 54
          ? "cpp"
          : "python"
      }
      theme="vs-dark"
      value={code}
      loading="Loading editor..."
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        roundedSelection: true,
        smoothScrolling: true,
        cursorSmoothCaretAnimation: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        automaticLayout: true,
      }}
      onChange={(value) => setCode(value ?? "")}
    />
  );
}

export default CodeEditor;