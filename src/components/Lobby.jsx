
import React, { useState } from 'react';
import { gameService } from '../lib/game.js';
import { Users, Copy, Play, UserX } from 'lucide-react';

export const Lobby = ({ room, players, currentUser, isAdmin, onLeave }) => {
  const [starting, setStarting] = useState(false);

  const handleStartGame = async () => {
    if (players.length < 3) {
      alert('Need at least 3 players to start the game!');
      return;
    }

    setStarting(true);
    try {
      await gameService.startGame(room.id);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game: ' + error.message);
    } finally {
      setStarting(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Undercover Game</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg text-gray-600">Room Code:</span>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-2xl font-mono font-bold text-blue-600">{room.code}</span>
                <button
                  onClick={copyRoomCode}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy room code"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
            <p className="text-gray-600">Share this code with your friends to join!</p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Players ({players.length})
            </h2>
          </div>
          
          <div className="grid gap-3">
            {players.map((player) => (
              <div 
                key={player.id} 
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{player.name}</span>
                    {player.isAdmin && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                
                {isAdmin && !player.isAdmin && (
                  <button 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Kick player"
                  >
                    <UserX size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">
            {isAdmin ? (
              <div>
                <button
                  onClick={handleStartGame}
                  disabled={starting || players.length < 3}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Play size={20} />
                  {starting ? 'Starting...' : 'Start Game'}
                </button>
                {players.length < 3 && (
                  <p className="text-red-500 text-sm mt-2">Need at least 3 players to start</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Waiting for admin to start the game...</p>
            )}
            
            <button
              onClick={onLeave}
              className="mt-4 text-red-500 hover:text-red-700 underline"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
