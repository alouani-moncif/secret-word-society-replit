
import React, { useState } from 'react';
import { gameService } from '../lib/game.js';
import { Eye, Send, Users, Clock } from 'lucide-react';

export const GamePlay = ({ room, players, currentUser, currentPlayer, isAdmin }) => {
  const [description, setDescription] = useState('');
  const [selectedVote, setSelectedVote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const alivePlayers = players.filter(p => p.isAlive);
  const votablePlayers = alivePlayers.filter(p => p.id !== currentUser?.uid);

  const handleSubmitDescription = async () => {
    if (!description.trim()) return;
    
    setSubmitting(true);
    try {
      await gameService.submitDescription(room.id, currentUser.uid, description);
      setDescription('');
    } catch (error) {
      console.error('Failed to submit description:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedVote) return;
    
    setSubmitting(true);
    try {
      await gameService.submitVote(room.id, currentUser.uid, selectedVote);
      setSelectedVote('');
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderDescriptionPhase = () => (
    <div className="space-y-6">
      {/* Player's Word */}
      <div className="bg-white rounded-lg shadow-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Word</h2>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <div className="text-3xl font-bold">{currentPlayer?.word}</div>
          <div className="text-sm mt-2 opacity-90">
            Describe this word without saying it directly
          </div>
        </div>
      </div>

      {/* Description Input */}
      {!currentPlayer?.description ? (
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Write Your Description
          </h3>
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your word in one sentence..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSubmitDescription}
              disabled={!description.trim() || submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Description'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Description</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-800">{currentPlayer.description}</p>
          </div>
          <p className="text-green-600 mt-2">✓ Description submitted! Waiting for others...</p>
        </div>
      )}

      {/* All Descriptions */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Descriptions</h3>
        <div className="space-y-3">
          {alivePlayers.map((player) => (
            <div key={player.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{player.name}</div>
                <div className="text-gray-600">
                  {player.description || <em className="text-gray-400">Writing description...</em>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVotingPhase = () => (
    <div className="space-y-6">
      {/* Voting Instructions */}
      <div className="bg-white rounded-lg shadow-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Voting Phase</h2>
        <p className="text-gray-600">
          Vote for the player you think is the undercover agent!
        </p>
      </div>

      {/* All Descriptions Review */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Descriptions</h3>
        <div className="space-y-3">
          {alivePlayers.map((player) => (
            <div key={player.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800 mb-1">{player.name}</div>
              <div className="text-gray-700">{player.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting */}
      {!currentPlayer?.hasVoted ? (
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cast Your Vote</h3>
          <div className="space-y-3 mb-4">
            {votablePlayers.map((player) => (
              <label 
                key={player.id} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="radio"
                  name="vote"
                  value={player.id}
                  checked={selectedVote === player.id}
                  onChange={(e) => setSelectedVote(e.target.value)}
                  className="text-blue-600"
                />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{player.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSubmitVote}
            disabled={!selectedVote || submitting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {submitting ? 'Voting...' : 'Submit Vote'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-6 text-center">
          <p className="text-green-600">✓ Vote submitted! Waiting for others...</p>
        </div>
      )}

      {/* Voting Progress */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Progress</h3>
        <div className="space-y-2">
          {alivePlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between">
              <span className="text-gray-800">{player.name}</span>
              <span className={`px-2 py-1 rounded text-sm ${
                player.hasVoted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {player.hasVoted ? 'Voted' : 'Waiting'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              <span className="font-medium">Round {room.currentRound}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={20} className="text-purple-600" />
              <span className="font-medium capitalize">{room.phase} Phase</span>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {room.phase === 'describing' && renderDescriptionPhase()}
        {room.phase === 'voting' && renderVotingPhase()}
      </div>
    </div>
  );
};
