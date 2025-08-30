import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike'; // for C/C++
import 'codemirror/addon/edit/closebrackets';
import { initSocket } from './socket';
import { initCompilerSocket } from './compilerSocket';
import Client from './Client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ACTIONS from './Actions';

const Editor = ({ roomId, user }) => {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const compilerSocketRef = useRef(null);
  const [users, setUsers] = useState({});
  const [compilerOutput, setCompilerOutput] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();
        compilerSocketRef.current = await initCompilerSocket();

        socketRef.current.emit(ACTIONS.JOIN, { roomId, user });

        socketRef.current.on(ACTIONS.JOINED, ({ users: allUsers, user: joinedUser }) => {
          setUsers(allUsers);
          if (joinedUser?.name && joinedUser?.socketId !== socketRef.current.id)
            toast.info(`${joinedUser.name} joined the room`);
        });

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ users: allUsers, user: leftUser }) => {
          setUsers(allUsers);
          if (leftUser?.name) toast.info(`${leftUser.name} left the room`);
        });

        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
          if (editorRef.current && editorRef.current.getValue() !== code) {
            editorRef.current.setValue(code);
          }
        });

        compilerSocketRef.current.on('compiler-output', (data) => {
          setCompilerOutput(data.output);
        });
      } catch (err) {
        toast.error('Socket connection failed');
        console.error(err);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      compilerSocketRef.current?.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    const cm = Codemirror.fromTextArea(document.getElementById('code-editor'), {
      mode: language,
      theme: 'material',
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      lineWrapping: true,
    });

    editorRef.current = cm;

    cm.on('change', (instance) => {
      const code = instance.getValue();
      socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code });
    });
  }, [language]);

  const runCode = async () => {
    try {
      const code = editorRef.current?.getValue();
      if (!code) return toast.error('Code is empty');
      compilerSocketRef.current?.emit('compiler-output', { roomId, code, language });
    } catch (err) {
      toast.error('Error running code');
      console.error(err);
    }
  };

  const leaveRoom = () => {
    window.location.href = '/';
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied!');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Users List */}
      <div style={{ width: '220px', borderRight: '1px solid #555', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ overflowY: 'auto' }}>
          <h3>Users</h3>
          {Object.values(users).map((u, idx) => (
            <Client key={idx} username={u?.name || 'Unknown'} />
          ))}
        </div>

        {/* Bottom Buttons */}
        <div style={{ paddingBottom: '10px' }}>
          <button onClick={copyRoomId} style={{ padding: '8px 12px', marginBottom: '5px', width: '100%' }}>
            Copy Room ID
          </button>
          <button onClick={leaveRoom} style={{ padding: '8px 12px', width: '100%', background: '#f44336', color: '#fff', border: 'none' }}>
            Leave Room
          </button>
        </div>
      </div>

      {/* Editor & Compiler */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Language Dropdown */}
        <div style={{ padding: '10px', background: '#1e1e1e', color: '#fff' }}>
          <label>Language: </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="text/x-c++src">C++</option>
            <option value="text/x-java">Java</option>
          </select>
        </div>

        {/* CodeMirror */}
        <textarea id="code-editor" defaultValue="// Start coding..." style={{ flex: 1 }} />

        {/* Compiler Output */}
        <div style={{ background: '#1e1e1e', color: '#fff', padding: '10px', height: '150px', overflowY: 'auto' }}>
          <h4>Compiler Output:</h4>
          <pre>{compilerOutput}</pre>
        </div>

        {/* Run Button at bottom-right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', background: '#333' }}>
          <button onClick={runCode} style={{ padding: '8px 12px', background: '#4caf50', color: '#fff', border: 'none' }}>
            Run Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
