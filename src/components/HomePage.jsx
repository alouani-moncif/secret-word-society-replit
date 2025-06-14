
import React, { useState } from 'react';
import { gameService } from '../lib/game.js';
import { authService } from '../lib/auth.js';
import { Users, Plus, LogIn, GamepadIcon } from 'lucide-react';

export const HomePage = ({ onJoinRoom }) => {
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      const user = await authService.signIn();
      const result = await gameService.createRoom(user.uid, playerName.trim());
      onJoinRoom(result.roomId);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!joinCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      const user = await authService.signIn();
      const room = await gameService.getRoomByCode(joinCode.trim().toUpperCase());
      
      if (!room) {
        setError('Room not found. Please check the code.');
        return;
      }

      await gameService.joinRoom(room.id, user.uid, playerName.trim());
      onJoinRoom(room.id);
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <GamepadIcon className="mx-auto mb-4" size={64} />
          <h1 className="text-4xl font-bold mb-2">Undercover</h1>
          <p className="text-xl opacity-90">The Social Word Game</p>
        </div>

        {/* Player Name Input */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !playerName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <Plus size={20} />
            {isCreating ? 'Creating...' : 'Create New Room'}
          </button>

          <div className="text-center text-gray-500 my-4">or</div>

          {/* Join Room */}
          <div className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-center text-lg font-mono"
              maxLength={6}
            />
            
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !playerName.trim() || !joinCode.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-white">
          <h3 className="font-bold mb-2">How to Play</h3>
          <ul className="text-sm space-y-1 opacity-90">
            <li>• Most players get the same word</li>
            <li>• 1-2 players get a different word (undercover)</li>
            <li>• Describe your word without saying it</li>
            <li>• Vote to eliminate the undercover agent</li>
            <li>• Undercover wins if they survive to the end!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
