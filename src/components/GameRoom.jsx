
import React, { useState, useEffect } from 'react';
import { gameService } from '../lib/game.js';
import { authService } from '../lib/auth.js';
import { Lobby } from './Lobby.jsx';
import { GamePlay } from './GamePlay.jsx';
import { Results } from './Results.jsx';

export const GameRoom = ({ roomId, onLeave }) => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    const unsubscribeRoom = gameService.listenToRoom(roomId, (doc) => {
      if (doc.exists()) {
        setRoom({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    const unsubscribePlayers = gameService.listenToPlayers(roomId, (snapshot) => {
      const playersList = snapshot.docs.map(doc => ({ 
        docId: doc.id, 
        ...doc.data() 
      }));
      setPlayers(playersList);
    });

    return () => {
      unsubscribeRoom();
      unsubscribePlayers();
      gameService.cleanup(roomId);
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Room not found</div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === currentUser?.uid);
  const isAdmin = currentPlayer?.isAdmin || false;

  if (room.status === 'lobby') {
    return (
      <Lobby 
        room={room} 
        players={players} 
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLeave={onLeave}
      />
    );
  }

  if (room.status === 'playing') {
    return (
      <GamePlay 
        room={room} 
        players={players} 
        currentUser={currentUser}
        currentPlayer={currentPlayer}
        isAdmin={isAdmin}
      />
    );
  }

  if (room.status === 'finished') {
    return (
      <Results 
        room={room} 
        players={players} 
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLeave={onLeave}
      />
    );
  }

  return null;
};
