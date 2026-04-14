# CodeSync

**Live Demo:** [https://codesync-virid-tau.vercel.app/](https://codesync-virid-tau.vercel.app/)

Collaborate on code in real‐time with multiple peers in the same room. Code together without friction—create a room, share the code, and watch changes sync instantly across all connected users.

## Features

- ✨ **Real-time Collaboration**: All code edits, language changes, and execution outputs sync instantly across all peers in a room
- 💬 **Live Chat**: Send and receive messages with other collaborators, with sender names displayed
- 🎯 **Multi-Language Support**: Write and execute code in JavaScript, C++, or Python
- 👥 **Active User Display**: See who else is connected in your room
- ⌨️ **Keyboard Shortcuts**: Press `Ctrl + Enter` to run code instantly
- 🔗 **Easy Room Sharing**: Generate or join rooms with 6-character codes
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🚀 **Code Execution**: Run code with real-time output powered by Judge0 API

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time bidirectional communication
- **Monaco Editor** - Feature-rich code editor (VS Code editor)
- **CSS Grid & Flexbox** - Responsive layout

### Backend
- **Node.js & Express** - HTTP server framework
- **Socket.IO** - WebSocket-based real-time events
- **CORS** - Cross-origin resource sharing
- **Axios** - HTTP client for external APIs
- **Judge0 API** - Code execution engine (JavaScript, C++, Python)

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend (Socket.IO + Express) hosting

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Codesync
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   node index.js
   ```
   The backend will start on `http://localhost:5000`

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

4. **Open your browser**
   Navigate to `http://localhost:5173` and start collaborating!

## How to Use

1. **Create a New Room**
   - Go to the home page
   - Enter your display name
   - Click "Create room"
   - Share the 6-character room code with collaborators

2. **Join an Existing Room**
   - Enter the room code shared by someone else
   - Enter your display name
   - Click "Join room"
   - You're now synced with all other users in that room

3. **Write and Share Code**
   - Use the Monaco editor to write code
   - Select your language (JavaScript, C++, or Python)
   - Press `Ctrl + Enter` or click the "Run Code" button to execute
   - Output is shared with all peers in real-time

4. **Chat with Peers**
   - Use the chat panel to send messages
   - See sender names and message history
   - Chat is local to each room

## Project Structure

```
Codesync/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Room creation/join interface
│   │   │   └── Editor.jsx         # Main collaborative editor
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx     # Monaco editor wrapper
│   │   │   └── ChatBox.jsx        # Real-time chat UI
│   │   ├── App.jsx                # React Router setup
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Express + Socket.IO backend
    ├── index.js            # Main server file
    └── package.json
```

## API Endpoints

### WebSocket Events

**Client → Server:**
- `join_room` - User joins a room
- `code_change` - Code editor content updated
- `language_change` - Programming language selected
- `output_change` - Code execution output received
- `send_message` - Chat message sent

**Server → Client:**
- `code_update` - Receive code changes from other users
- `language_update` - Receive language changes
- `output_update` - Receive output updates
- `receive_message` - Receive chat messages
- `user_list` - Active users in room

### HTTP Endpoints

- `POST /run` - Execute code
  - Body: `{ code: string, languageId: number }`
  - Response: `{ output: string }`

## Deployment Guide

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Deploy and note the URL (e.g., `https://your-service.onrender.com`)

### Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - Key: `VITE_SERVER_URL`
   - Value: Your Render backend URL (e.g., `https://your-service.onrender.com`)
5. Deploy

### Update Client for Production

After deployment, the client will automatically use the production backend URL from the environment variable.

## Performance & Architecture

- **Real-time Sync**: Uses WebSocket connections for sub-100ms latency
- **Stateless Rooms**: Rooms are ephemeral and stored in server memory (perfect for short sessions)
- **Scalable Execution**: Code runs on Judge0's infrastructure, not your server
- **Responsive UI**: Built with CSS Grid for adaptive layouts

## Limitations & Future Enhancements

- Rooms are in-memory (data lost on server restart)
- No persistent user authentication
- No room persistence between sessions
- Potential enhancements:
  - Database for persistent rooms
  - User accounts & authentication
  - Typing presence indicators
  - Shared cursor positions
  - Code history & undo for all users
  - More language support
  - Private/password-protected rooms

## Troubleshooting

**"Reconnecting" status:**
- Ensure the backend is running on `http://localhost:5000`
- Check if Socket.IO is properly initialized
- Verify CORS settings in the backend

**Code won't execute:**
- Ensure the backend can reach Judge0 API
- Check code syntax for your selected language
- Monitor the browser console for errors

**Chat not sending:**
- Verify you've joined a room
- Check the room ID is the same for all users

## Contributing

Contributions are welcome! Fork the repo, make your changes, and submit a pull request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for developers who love collaborating**
