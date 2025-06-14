
import { db } from './firebase.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

export class GameService {
  constructor() {
    this.roomListeners = new Map();
    this.playersListeners = new Map();
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createRoom(adminId, adminName) {
    const roomCode = this.generateRoomCode();
    
    const roomData = {
      code: roomCode,
      adminId,
      adminName,
      status: 'lobby', // lobby, playing, finished
      phase: 'waiting', // waiting, describing, voting, results
      createdAt: new Date(),
      gameSettings: {
        chatEnabled: true,
        maxPlayers: 10
      },
      currentRound: 0,
      words: null,
      votingResults: null
    };

    const roomRef = await addDoc(collection(db, 'rooms'), roomData);
    
    // Add admin as first player
    await this.joinRoom(roomRef.id, adminId, adminName, true);
    
    return { roomId: roomRef.id, roomCode };
  }

  async joinRoom(roomId, playerId, playerName, isAdmin = false) {
    const playerData = {
      id: playerId,
      name: playerName,
      isAdmin,
      isAlive: true,
      role: null, // 'normal', 'undercover', 'white'
      word: null,
      description: null,
      votes: 0,
      hasVoted: false,
      joinedAt: new Date()
    };

    await addDoc(collection(db, `rooms/${roomId}/players`), playerData);
  }

  async getRoomByCode(code) {
    const q = query(collection(db, 'rooms'), where('code', '==', code));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async getRandomWordPair() {
    const wordsSnapshot = await getDocs(collection(db, 'words'));
    const wordDocs = wordsSnapshot.docs;
    
    if (wordDocs.length === 0) {
      // Fallback words if none in database
      const fallbackPairs = [
        { normal: 'Apple', undercover: 'Orange' },
        { normal: 'Dog', undercover: 'Cat' },
        { normal: 'Car', undercover: 'Truck' }
      ];
      return fallbackPairs[Math.floor(Math.random() * fallbackPairs.length)];
    }
    
    const randomDoc = wordDocs[Math.floor(Math.random() * wordDocs.length)];
    const data = randomDoc.data();
    
    // Assuming words document has pairs array
    const pairs = data.pairs || [];
    return pairs[Math.floor(Math.random() * pairs.length)] || { normal: 'Apple', undercover: 'Orange' };
  }

  async startGame(roomId) {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (players.length < 3) {
      throw new Error('Need at least 3 players to start');
    }

    const wordPair = await this.getRandomWordPair();
    const assignments = this.assignRoles(players, wordPair);
    
    // Update each player with their role and word
    for (const assignment of assignments) {
      const playerDoc = playersSnapshot.docs.find(doc => doc.data().id === assignment.playerId);
      if (playerDoc) {
        await updateDoc(doc(db, `rooms/${roomId}/players`, playerDoc.id), {
          role: assignment.role,
          word: assignment.word,
          description: null,
          hasVoted: false,
          votes: 0
        });
      }
    }

    // Update room status
    await updateDoc(doc(db, 'rooms', roomId), {
      status: 'playing',
      phase: 'describing',
      words: wordPair,
      currentRound: 1
    });
  }

  assignRoles(players, wordPair) {
    const assignments = [];
    const playerCount = players.length;
    
    // Determine role distribution
    let undercoverCount = playerCount >= 7 ? 2 : 1;
    let whiteCount = playerCount >= 6 ? 1 : 0;
    
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Assign undercover roles
    for (let i = 0; i < undercoverCount; i++) {
      assignments.push({
        playerId: shuffledPlayers[i].id,
        role: 'undercover',
        word: wordPair.undercover
      });
    }
    
    // Assign white role
    if (whiteCount > 0) {
      assignments.push({
        playerId: shuffledPlayers[undercoverCount].id,
        role: 'white',
        word: 'Secret Agent'
      });
    }
    
    // Assign normal roles to remaining players
    for (let i = undercoverCount + whiteCount; i < playerCount; i++) {
      assignments.push({
        playerId: shuffledPlayers[i].id,
        role: 'normal',
        word: wordPair.normal
      });
    }
    
    return assignments;
  }

  async submitDescription(roomId, playerId, description) {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
    const playerDoc = playersSnapshot.docs.find(doc => doc.data().id === playerId);
    
    if (playerDoc) {
      await updateDoc(doc(db, `rooms/${roomId}/players`, playerDoc.id), {
        description: description.trim()
      });
    }
    
    // Check if all players have submitted descriptions
    const allPlayers = playersSnapshot.docs.map(doc => doc.data());
    const alivePlayers = allPlayers.filter(p => p.isAlive);
    const submitted = alivePlayers.filter(p => p.description && p.description.trim());
    
    if (submitted.length === alivePlayers.length) {
      await updateDoc(doc(db, 'rooms', roomId), {
        phase: 'voting'
      });
    }
  }

  async submitVote(roomId, voterId, targetId) {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
    
    // Update voter
    const voterDoc = playersSnapshot.docs.find(doc => doc.data().id === voterId);
    if (voterDoc) {
      await updateDoc(doc(db, `rooms/${roomId}/players`, voterDoc.id), {
        hasVoted: true
      });
    }
    
    // Add vote to target
    const targetDoc = playersSnapshot.docs.find(doc => doc.data().id === targetId);
    if (targetDoc) {
      const currentVotes = targetDoc.data().votes || 0;
      await updateDoc(doc(db, `rooms/${roomId}/players`, targetDoc.id), {
        votes: currentVotes + 1
      });
    }
    
    // Check if all alive players have voted
    const allPlayers = playersSnapshot.docs.map(doc => doc.data());
    const alivePlayers = allPlayers.filter(p => p.isAlive);
    const votedPlayers = alivePlayers.filter(p => p.hasVoted);
    
    if (votedPlayers.length === alivePlayers.length) {
      await this.processVotingResults(roomId);
    }
  }

  async processVotingResults(roomId) {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
    const players = playersSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    const alivePlayers = players.filter(p => p.isAlive);
    
    // Find player with most votes
    const maxVotes = Math.max(...alivePlayers.map(p => p.votes || 0));
    const eliminatedCandidates = alivePlayers.filter(p => (p.votes || 0) === maxVotes);
    
    let eliminatedPlayer = null;
    if (eliminatedCandidates.length === 1) {
      eliminatedPlayer = eliminatedCandidates[0];
      // Eliminate the player
      const playerDoc = players.find(p => p.id === eliminatedPlayer.id);
      await updateDoc(doc(db, `rooms/${roomId}/players`, playerDoc.docId), {
        isAlive: false
      });
    }
    
    // Check win conditions
    const remainingPlayers = eliminatedPlayer 
      ? alivePlayers.filter(p => p.id !== eliminatedPlayer.id)
      : alivePlayers;
      
    const undercoverAlive = remainingPlayers.filter(p => p.role === 'undercover');
    const normalAlive = remainingPlayers.filter(p => p.role === 'normal');
    
    let gameResult = null;
    if (undercoverAlive.length === 0) {
      gameResult = 'normal_win';
    } else if (undercoverAlive.length >= normalAlive.length) {
      gameResult = 'undercover_win';
    }
    
    if (gameResult) {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'finished',
        phase: 'results',
        gameResult
      });
    } else {
      // Continue to next round
      await this.startNextRound(roomId);
    }
  }

  async startNextRound(roomId) {
    const playersSnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
    
    // Reset voting data
    for (const playerDoc of playersSnapshot.docs) {
      await updateDoc(doc(db, `rooms/${roomId}/players`, playerDoc.id), {
        description: null,
        hasVoted: false,
        votes: 0
      });
    }
    
    // Update room to next round
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    const currentRound = roomDoc.data().currentRound || 1;
    
    await updateDoc(doc(db, 'rooms', roomId), {
      phase: 'describing',
      currentRound: currentRound + 1
    });
  }

  listenToRoom(roomId, callback) {
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), callback);
    this.roomListeners.set(roomId, unsubscribe);
    return unsubscribe;
  }

  listenToPlayers(roomId, callback) {
    const q = query(collection(db, `rooms/${roomId}/players`), orderBy('joinedAt'));
    const unsubscribe = onSnapshot(q, callback);
    this.playersListeners.set(roomId, unsubscribe);
    return unsubscribe;
  }

  cleanup(roomId) {
    if (this.roomListeners.has(roomId)) {
      this.roomListeners.get(roomId)();
      this.roomListeners.delete(roomId);
    }
    if (this.playersListeners.has(roomId)) {
      this.playersListeners.get(roomId)();
      this.playersListeners.delete(roomId);
    }
  }
}

export const gameService = new GameService();
