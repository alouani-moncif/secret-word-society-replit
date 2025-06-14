
import React, { useState, useEffect } from 'react';
import { authService } from '../lib/auth.js';
import { HomePage } from '../components/HomePage.jsx';
import { GameRoom } from '../components/GameRoom.jsx';

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authService.init().then(() => {
      setAuthReady(true);
    });
  }, []);

  const handleJoinRoom = (roomId) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (currentRoom) {
    return <GameRoom roomId={currentRoom} onLeave={handleLeaveRoom} />;
  }

  return <HomePage onJoinRoom={handleJoinRoom} />;
};

export default Index;
