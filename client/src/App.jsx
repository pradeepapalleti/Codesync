import React from 'react'
import Home from './pages/Home'
import Editor from './pages/Editor'
import { BrowserRouter,Routes, Route } from 'react-router-dom'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/editor/:roomId" element={<Editor/>}/>
      </Routes>
    </BrowserRouter>

  );
}

export default App;