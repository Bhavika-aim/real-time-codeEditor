import React, { useRef, useState } from "react";
import EditorPage from "./EditorPage";
import CompilerSync from "../components/CompilerSync";

const EditorWithCompiler = () => {
  const codeRef = useRef(""); // captures latest code
  const [roomId, setRoomId] = useState(""); // will be set from EditorPage

  return (
    <div className="flex flex-col h-screen">
      {/* Collaborative Editor */}
      <div className="flex-1">
        <EditorPage
          onCodeUpdate={(code) => {
            codeRef.current = code;
          }}
          setRoomId={setRoomId} // get roomId from EditorPage
        />
      </div>

      {/* Compiler Panel */}
      {roomId && (
        <div className="border-t bg-gray-50 p-3">
          <h3 className="font-semibold mb-2">Collaborative Compiler</h3>
          <CompilerSync roomId={roomId} code={codeRef.current} />
        </div>
      )}
    </div>
  );
};

export default EditorWithCompiler;
