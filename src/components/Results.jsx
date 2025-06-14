
import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export const Results = ({ room, players, currentUser, isAdmin, onLeave }) => {
  const handleNewGame = async () => {
    // This would restart the game with new words
    console.log('Starting new game...');
  };

  const normalPlayers = players.filter(p => p.role === 'normal');
  const undercoverPlayers = players.filter(p => p.role === 'undercover');
  const whitePlayers = players.filter(p => p.role === 'white');

  const winners = room.gameResult === 'normal_win' ? normalPlayers : undercoverPlayers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 text-center">
          <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h1>
          <div className="text-xl text-gray-700">
            {room.gameResult === 'normal_win' ? (
              <span className="text-blue-600 font-semibold">Normal Players Win!</span>
            ) : (
              <span className="text-red-600 font-semibold">Undercover Players Win!</span>
            )}
          </div>
        </div>

        {/* Words Revealed */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Words This Round</h2>
          <div className="grid gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-blue-800 mb-1">Normal Word</div>
              <div className="text-2xl font-bold text-blue-600">{room.words?.normal}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="font-medium text-red-800 mb-1">Undercover Word</div>
              <div className="text-2xl font-bold text-red-600">{room.words?.undercover}</div>
            </div>
          </div>
        </div>

        {/* Player Roles Revealed */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Player Roles</h2>
          <div className="space-y-3">
            {players.map((player) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  winners.some(w => w.id === player.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    player.role === 'normal' ? 'bg-blue-100 text-blue-800' :
                    player.role === 'undercover' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {player.role === 'normal' ? 'Normal' :
                     player.role === 'undercover' ? 'Undercover' : 'White'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Word: {player.word}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAdmin && (
              <button
                onClick={handleNewGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <RotateCcw size={20} />
                New Game
              </button>
            )}
            <button
              onClick={onLeave}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <Home size={20} />
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
