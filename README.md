Real-Time Collaborative Code Editor

**A full-stack real-time collaborative code editor built with React, Node.js, Express, Socket.IO, and RapidAPI Codex Compiler API. Users can join rooms, collaborate on code, compile and run code in multiple languages, and see live updates with avatars and notifications.**

Features

Real-time Collaboration: Multiple users can join the same room and edit code together.

Live User Avatars: Displays avatars for all users in a room.

Join & Leave Notifications: Users are notified when someone joins or leaves the room.

Code Compilation: Supports running code in JavaScript, Java, C++, Python, and more using RapidAPI Codex Compiler.

Language Selection: Change programming language dynamically.

Copy Room ID: Easily share the room ID with others.

Leave Room Button: Exit a room gracefully.

Responsive Fullscreen Editor: No scrollbars, full-screen code editing.

Auto-Brackets & Syntax Highlighting: Using CodeMirror.

Toast Notifications: Informative messages for actions/events.



Tech Stack

**Frontend:** React, CodeMirror, CSS, React-Avatar, React-Toastify

**Backend:** Node.js, Express, Socket.IO

**Compiler:** RapidAPI Codex Compiler

**Realtime Communication:** WebSockets via Socket.IO

**Usage**

**Open the app in a browser.

Enter a username and create or join a room.

Edit code collaboratively in real-time.

Select a language from the dropdown.

Click Run to compile code using RapidAPI.

Use Copy Room ID to invite others.

Click Leave Room to exit the session.**

**
Create a .env file in the root directory:**

PORT=5000
REACT_APP_BACKEND_URL=http://localhost:5000
RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
