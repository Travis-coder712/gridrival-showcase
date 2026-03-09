import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';

export default function TeamJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinGame, gameState, connected, reconnecting, clearSession, lastError, clearLastError, lateJoinTeam, isLateJoiner } = useSocket();
  const [teamName, setTeamName] = useState('');
  const [gameId, setGameId] = useState(searchParams.get('game') || '');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const inviteCode = searchParams.get('invite') || '';
  const [lateJoining, setLateJoining] = useState(false);

  // If we have stored credentials, try to redirect to game (reconnection will happen via SocketContext)
  useEffect(() => {
    const savedTeamId = sessionStorage.getItem('nem_team_id');
    if (savedTeamId && connected) {
      // We have saved credentials - redirect to game page, reconnection will be attempted
      navigate('/team/game');
    }
  }, [connected, navigate]);

  // Auto-discover game if not provided
  useEffect(() => {
    if (!gameId) {
      fetch('/api/games')
        .then(r => r.json())
        .then(data => {
          if (data.games && data.games.length > 0) {
            setGameId(data.games[0].id);
          }
        })
        .catch(() => {});
    }
  }, [gameId]);

  useEffect(() => {
    if (gameState && gameState.myTeam) {
      navigate('/team/game');
    }
  }, [gameState, navigate]);

  // If we have an invite code, auto-trigger late-join once connected
  useEffect(() => {
    if (inviteCode && connected && !lateJoining && gameId) {
      setLateJoining(true);
      lateJoinTeam(gameId, inviteCode, `Observer-${inviteCode.slice(0, 3)}`);
    }
  }, [inviteCode, connected, gameId, lateJoining, lateJoinTeam]);

  // Redirect late-joiners to team game page once joined
  useEffect(() => {
    if (isLateJoiner && gameState?.myTeam) {
      navigate('/team/game');
    }
  }, [isLateJoiner, gameState, navigate]);

  // Show socket errors (e.g., duplicate team name)
  useEffect(() => {
    if (lastError) {
      setError(lastError);
      setJoining(false);
      setLateJoining(false);
      clearLastError();
    }
  }, [lastError, clearLastError]);

  const handleJoin = () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    if (!gameId.trim()) {
      setError('No game found. Ask the host for the game ID.');
      return;
    }

    // Clear any stale session before joining fresh
    clearSession();

    setError('');
    setJoining(true);
    joinGame(teamName.trim(), gameId.trim());

    // Timeout fallback
    setTimeout(() => {
      if (!gameState?.myTeam) {
        setJoining(false);
        setError('Could not join. Game may be full or already started.');
      }
    }, 5000);
  };

  // Show a different screen while late-joining via invite code
  if (inviteCode && lateJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4 animate-pulse">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Joining Team...</h1>
          <p className="text-navy-300 text-sm">Using invite code: <span className="font-mono text-electric-300">{inviteCode}</span></p>
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm">
              {error}
              <button
                onClick={() => navigate('/team/join')}
                className="block mt-2 text-electric-400 hover:text-electric-300 text-xs underline"
              >
                Try joining manually instead
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center px-4">
      <div className="max-w-sm w-full animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-2xl font-bold text-white">Join Game</h1>
          <p className="text-navy-300 text-sm mt-1">Enter your team name to start playing</p>
        </div>

        <div className="space-y-4">
          {/* Game ID */}
          <div>
            <label className="block text-xs text-navy-400 mb-1">Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              placeholder="Enter game ID..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-navy-500 focus:border-electric-400 focus:outline-none focus:ring-1 focus:ring-electric-400 text-sm"
            />
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-xs text-navy-400 mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Power Rangers"
              maxLength={20}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-navy-500 focus:border-electric-400 focus:outline-none focus:ring-1 focus:ring-electric-400 text-lg font-medium"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={!connected || joining || !teamName.trim()}
            className="w-full py-4 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric-500/30"
          >
            {joining ? 'Joining...' : 'Join Game →'}
          </button>
        </div>

        <div className="text-center mt-6 space-y-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
            connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Connected to server' : 'Connecting...'}
          </div>

          <div>
            <button
              onClick={() => navigate(`/spectate${gameId ? `?game=${gameId}` : ''}`)}
              className="text-navy-400 hover:text-electric-300 text-xs transition-colors"
            >
              👁️ Just watching? Join as an observer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
