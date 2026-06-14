import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gamepad2, Swords, Shield, Scroll, Sparkles, Gem, X, Flame, Lock, CloudSun, Compass, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { useStore, SPIRITUAL_ROOTS, CULTIVATION_LEVELS } from '../store';
const KunwuPhaserGame = lazy(() => import('../components/KunwuPhaserGame'));
const MonsterHuntPhaserGame = lazy(() => import('../components/MonsterHuntPhaserGame'));
const DevilfallPhaserGame = lazy(() => import('../components/DevilfallPhaserGame'));
const DemonAbyssHost = lazy(() => import('../components/DemonAbyss/DemonAbyssHost'));
import LeaderboardPanel, { submitScore, HallTopBoard } from '../components/LeaderboardPanel';
import { sfx, isMuted, toggleMuted, subscribeMute } from '../games/audio';
import { getAllLocalHighScores, updateLocalHighScore } from '../games/highScores';

// --- 2048 Game Logic ---
const rotateRight = (matrix: number[][]) => {
  const result: number[][] = [];
  for (let c = 0; c < 4; c++) {
    const newRow: number[] = [];
    for (let r = 3; r >= 0; r--) {
      newRow.push(matrix[r][c]);
    }
    result.push(newRow);
  }
  return result;
};

const moveLeft = (board: number[][]) => {
  const newBoard: number[][] = [];
  let addedScore = 0;
  let moved = false;
  for (let r = 0; r < 4; r++) {
    const row = board[r].filter(val => val !== 0);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i+1]) {
        row[i] *= 2;
        addedScore += row[i];
        row.splice(i+1, 1);
      }
    }
    while (row.length < 4) row.push(0);
    if (row.join(',') !== board[r].join(',')) moved = true;
    newBoard.push(row);
  }
  return { newBoard, addedScore, moved };
};

const getEmptyCoordinates = (board: number[][]) => {
  const empty: {r: number, c: number}[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push({r, c});
    }
  }
  return empty;
};

const spawnTile = (board: number[][]) => {
  const newBoard = [...board.map(row => [...row])];
  const empty = getEmptyCoordinates(newBoard);
  if (empty.length > 0) {
    const coord = empty[Math.floor(Math.random() * empty.length)];
    newBoard[coord.r][coord.c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
};

const Game2048 = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [board, setBoard] = useState<number[][]>(() => spawnTile(spawnTile([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;
    let currentBoard = board;
    let rotations = 0;
    if (direction === 'RIGHT') rotations = 2;
    else if (direction === 'UP') rotations = 3;
    else if (direction === 'DOWN') rotations = 1;

    for (let i = 0; i < rotations; i++) currentBoard = rotateRight(currentBoard);
    
    const { newBoard, addedScore, moved } = moveLeft(currentBoard);
    currentBoard = newBoard;
    
    for (let i = 0; i < (4 - rotations) % 4; i++) currentBoard = rotateRight(currentBoard);

    if (moved) {
      const finalBoard = spawnTile(currentBoard);
      setBoard(finalBoard);
      setScore(s => s + addedScore);
      if (addedScore > 0) sfx.merge();
      if (getEmptyCoordinates(finalBoard).length === 0) {
        // Check if truly game over (no adjacent merges possible)
        let canMove = false;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 3; c++) {
            if (finalBoard[r][c] === finalBoard[r][c+1] || finalBoard[c][r] === finalBoard[c+1][r]) {
              canMove = true;
            }
          }
        }
        if (!canMove) {
          setGameOver(true);
          onGameOver(score + addedScore);
        }
      }
    }
  }, [board, gameOver, score, onGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleMove('UP');
      if (e.key === 'ArrowDown') handleMove('DOWN');
      if (e.key === 'ArrowLeft') handleMove('LEFT');
      if (e.key === 'ArrowRight') handleMove('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const touchStart = useRef<{x: number, y: number} | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) handleMove('RIGHT');
      else if (dx < -30) handleMove('LEFT');
    } else {
      if (dy > 30) handleMove('DOWN');
      else if (dy < -30) handleMove('UP');
    }
    touchStart.current = null;
  };

  const useGoldenFinger = () => {
    // 金手指：点石成金 (所有方块翻倍)
    setBoard(prev => prev.map(row => row.map(cell => cell > 0 ? cell * 2 : 0)));
    setGameOver(false);
  };

  const resetGame = () => {
    setBoard(spawnTile(spawnTile([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])));
    setScore(0);
    setGameOver(false);
  };

  const getCellColor = (val: number) => {
    const colors: Record<number, string> = {
      0: 'bg-slate-800', 2: 'bg-slate-600 text-slate-200', 4: 'bg-slate-500 text-slate-100',
      8: 'bg-emerald-500 text-white', 16: 'bg-emerald-600 text-white', 32: 'bg-sky-500 text-white',
      64: 'bg-sky-600 text-white', 128: 'bg-indigo-500 text-white', 256: 'bg-indigo-600 text-white',
      512: 'bg-purple-500 text-white', 1024: 'bg-purple-600 text-white', 2048: 'bg-rose-500 text-white'
    };
    return colors[val] || 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-4 items-end">
        <div>
          <p className="text-slate-400 text-xs">分数</p>
          <p className="text-2xl font-bold text-white">{score}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={useGoldenFinger} className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-sm border border-amber-500/30">
            <Zap size={16} /> <span>点石成金</span>
          </button>
          <button onClick={resetGame} className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div 
        className="bg-slate-700 p-2 rounded-xl w-full aspect-square relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {board.map((row, rIdx) => 
            row.map((cell, cIdx) => (
              <div key={`${rIdx}-${cIdx}`} className={`flex items-center justify-center rounded-lg text-xl font-bold transition-all duration-200 ${getCellColor(cell)}`}>
                {cell > 0 ? cell : ''}
              </div>
            ))
          )}
        </div>
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center z-10">
            <p className="text-2xl font-bold text-white mb-4">历练结束</p>
            <button onClick={resetGame} className="bg-emerald-500 text-white px-6 py-2 rounded-full">再次挑战</button>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs mt-4">在方块区域滑动手指来移动</p>
    </div>
  );
};

// --- Snake Game Logic ---
const GRID_SIZE = 15;
const INITIAL_SNAKE = [{x: 7, y: 7}, {x: 7, y: 8}];
const INITIAL_DIR = {x: 0, y: -1};

const SnakeGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIR);
  const [food, setFood] = useState({x: 3, y: 3});
  const [gameOver, setGameOver] = useState(false);
  const [wallPass, setWallPass] = useState(false);
  const [score, setScore] = useState(0);

  const spawnFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    setFood(newFood);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        let nx = head.x + dir.x;
        let ny = head.y + dir.y;

        if (wallPass) {
          if (nx < 0) nx = GRID_SIZE - 1;
          if (nx >= GRID_SIZE) nx = 0;
          if (ny < 0) ny = GRID_SIZE - 1;
          if (ny >= GRID_SIZE) ny = 0;
        } else {
          if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
            sfx.fail();
            setGameOver(true);
            onGameOver(score);
            return prev;
          }
        }

        if (prev.some(segment => segment.x === nx && segment.y === ny)) {
          sfx.fail();
          setGameOver(true);
          onGameOver(score);
          return prev;
        }

        const newSnake = [{x: nx, y: ny}, ...prev];
        if (nx === food.x && ny === food.y) {
          sfx.eat();
          setScore(s => s + 10);
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [dir, gameOver, food, wallPass, spawnFood, score, onGameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIR);
    setScore(0);
    setGameOver(false);
    spawnFood(INITIAL_SNAKE);
  };

  const handleDir = (newDir: {x: number, y: number}) => {
    if (dir.x === -newDir.x && dir.y === -newDir.y) return; // Prevent reversing
    setDir(newDir);
  };

  const touchStart = useRef<{x: number, y: number} | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) handleDir({x: 1, y: 0});
      else if (dx < -30) handleDir({x: -1, y: 0});
    } else {
      if (dy > 30) handleDir({x: 0, y: 1});
      else if (dy < -30) handleDir({x: 0, y: -1});
    }
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-4 items-end">
        <div>
          <p className="text-slate-400 text-xs">分数</p>
          <p className="text-2xl font-bold text-white">{score}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setWallPass(!wallPass)} className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm border ${wallPass ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            <Zap size={16} /> <span>穿墙术: {wallPass ? '开' : '关'}</span>
          </button>
          <button onClick={resetGame} className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div 
        className="bg-slate-800 p-2 rounded-xl w-full aspect-square relative border border-slate-700 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="w-full h-full relative"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {/* Food */}
          <div 
            className="bg-rose-500 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.6)]"
            style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}
          />
          {/* Snake */}
          {snake.map((segment, i) => (
            <div 
              key={i} 
              className={`${i === 0 ? 'bg-emerald-400' : 'bg-emerald-500/80'} rounded-sm`}
              style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}
            />
          ))}
        </div>
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center z-10">
            <p className="text-2xl font-bold text-white mb-4">历练结束</p>
            <button onClick={resetGame} className="bg-emerald-500 text-white px-6 py-2 rounded-full">再次挑战</button>
          </div>
        )}
      </div>

      {/* D-Pad Controls */}
      <div className="grid grid-cols-3 gap-2 mt-6 w-48">
        <div />
        <button onClick={() => handleDir({x: 0, y: -1})} className="bg-slate-800 active:bg-slate-700 p-4 rounded-xl flex justify-center border border-slate-700"><ArrowUp size={24} className="text-slate-300"/></button>
        <div />
        <button onClick={() => handleDir({x: -1, y: 0})} className="bg-slate-800 active:bg-slate-700 p-4 rounded-xl flex justify-center border border-slate-700"><ArrowLeft size={24} className="text-slate-300"/></button>
        <button onClick={() => handleDir({x: 0, y: 1})} className="bg-slate-800 active:bg-slate-700 p-4 rounded-xl flex justify-center border border-slate-700"><ArrowDown size={24} className="text-slate-300"/></button>
        <button onClick={() => handleDir({x: 1, y: 0})} className="bg-slate-800 active:bg-slate-700 p-4 rounded-xl flex justify-center border border-slate-700"><ArrowRight size={24} className="text-slate-300"/></button>
      </div>
    </div>
  );
};

// --- Alchemy Game Logic (Reaction Time) ---
const AlchemyGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'success' | 'fail'>('waiting');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  useEffect(() => {
    startGame();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTap = () => {
    if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sfx.fail();
      setGameState('fail');
      onGameOver(score);
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      sfx.pillSuccess();
      setGameState('success');
      
      let points = 0;
      if (time < 200) points = 50;
      else if (time < 300) points = 30;
      else if (time < 500) points = 10;
      else points = 5;
      
      setScore(s => s + points);
    } else if (gameState === 'success' || gameState === 'fail') {
      if (gameState === 'fail') {
        setScore(0);
      }
      startGame();
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-between w-full mb-4 items-end">
        <div>
          <p className="text-slate-400 text-xs">炼丹积分</p>
          <p className="text-2xl font-bold text-white">{score}</p>
        </div>
      </div>

      <div 
        className={`flex-1 w-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none ${
          gameState === 'waiting' ? 'bg-rose-900/50 border-2 border-rose-500/50' :
          gameState === 'ready' ? 'bg-emerald-500 border-2 border-emerald-400' :
          gameState === 'success' ? 'bg-sky-900/50 border-2 border-sky-500/50' :
          'bg-slate-800 border-2 border-slate-700'
        }`}
        onClick={handleTap}
      >
        {gameState === 'waiting' && (
          <>
            <Flame size={48} className="text-rose-500 mb-4 animate-pulse" />
            <p className="text-xl font-bold text-rose-200">控制火候...</p>
            <p className="text-sm text-rose-400/70 mt-2">等火焰变绿时点击</p>
          </>
        )}
        {gameState === 'ready' && (
          <>
            <Zap size={64} className="text-white mb-4" />
            <p className="text-3xl font-bold text-white">收丹！</p>
          </>
        )}
        {gameState === 'success' && (
          <>
            <Sparkles size={48} className="text-sky-400 mb-4" />
            <p className="text-xl font-bold text-sky-200">炼制成功！</p>
            <p className="text-lg text-sky-300 mt-2">反应时间: {reactionTime}ms</p>
            <p className="text-sm text-slate-400 mt-4">点击继续炼制</p>
          </>
        )}
        {gameState === 'fail' && (
          <>
            <X size={48} className="text-slate-500 mb-4" />
            <p className="text-xl font-bold text-slate-300">炸炉了！</p>
            <p className="text-sm text-slate-500 mt-2">点击太早了</p>
            <p className="text-sm text-slate-400 mt-4">点击重新开始</p>
          </>
        )}
      </div>
    </div>
  );
};

// --- Memory Game Logic (Treasure Hunt) ---
const MEMORY_CARDS = ['💎', '🔮', '📜', '🗡️', '🌿', '💊', '🔥', '💧'];

const MemoryGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [cards, setCards] = useState<{id: number, icon: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    const shuffled = [...MEMORY_CARDS, ...MEMORY_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setFlippedIndices([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched || gameOver) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      if (newCards[firstIndex].icon === newCards[secondIndex].icon) {
        // Match
        sfx.merge();
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setScore(s => s + 20);

          if (matchedCards.every(c => c.isMatched)) {
            setGameOver(true);
            onGameOver(score + 20 + Math.max(0, 100 - moves * 5)); // Bonus for fewer moves
          }
        }, 500);
      } else {
        // No match
        sfx.click();
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setScore(s => Math.max(0, s - 2));
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-between w-full mb-4 items-end">
        <div>
          <p className="text-slate-400 text-xs">寻宝积分 (步数: {moves})</p>
          <p className="text-2xl font-bold text-white">{score}</p>
        </div>
        <button onClick={initializeGame} className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="bg-slate-800 p-2 rounded-xl w-full aspect-square relative border border-slate-700">
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`relative w-full h-full rounded-lg cursor-pointer perspective-1000`}
              onClick={() => handleCardClick(index)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`w-full h-full absolute inset-0 backface-hidden flex items-center justify-center rounded-lg text-3xl shadow-md ${
                  card.isFlipped || card.isMatched ? 'bg-slate-700 border border-slate-600' : 'bg-slate-600 border border-slate-500'
                }`}
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of card (hidden when flipped) */}
                <div className="absolute inset-0 bg-slate-700 rounded-lg flex items-center justify-center backface-hidden" style={{ transform: 'rotateY(0deg)' }}>
                  <Shield size={24} className="text-slate-500/50" />
                </div>
                {/* Back of card (visible when flipped) */}
                <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                  <span className={card.isMatched ? 'opacity-50' : 'opacity-100'}>{card.icon}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center z-10">
            <p className="text-2xl font-bold text-white mb-4">寻宝结束</p>
            <p className="text-sm text-slate-300 mb-6">总步数: {moves}</p>
            <button onClick={initializeGame} className="bg-emerald-500 text-white px-6 py-2 rounded-full">再次寻宝</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Meditation Game Logic ---
const MeditationGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setScore(100);
      onGameOver(100);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onGameOver]);

  const startMeditation = () => {
    setTimeLeft(60);
    setIsActive(true);
    setScore(0);
  };

  const stopMeditation = () => {
    setIsActive(false);
    setTimeLeft(60);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div className={`w-64 h-64 rounded-full flex items-center justify-center border-4 transition-all duration-1000 ${isActive ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'border-slate-700'}`}>
        <div className="text-center">
          <p className="text-5xl font-light text-white mb-2">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm text-slate-400">{isActive ? '心如止水...' : '准备闭关'}</p>
        </div>
      </div>
      
      <div className="mt-12">
        {!isActive ? (
          <button onClick={startMeditation} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-emerald-500/20 transition-colors">
            开始闭关 (1分钟)
          </button>
        ) : (
          <button onClick={stopMeditation} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 px-8 py-3 rounded-full font-medium transition-colors">
            走火入魔 (放弃)
          </button>
        )}
      </div>
      
      {score > 0 && (
        <p className="mt-6 text-emerald-400 font-medium animate-pulse">闭关圆满，获得 {score} 历练积分！</p>
      )}
    </div>
  );
};

// --- Monster Hunt Game Logic ---
const MonsterHuntGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [monsters, setMonsters] = useState<{ id: number, x: number, y: number, type: string }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (Math.random() < 0.5) {
          setMonsters(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, type: Math.random() > 0.8 ? 'boss' : 'normal' }]);
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onGameOver(score * 100);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, score, onGameOver]);

  const catchMonster = (id: number, type: string) => {
    setMonsters(prev => prev.filter(m => m.id !== id));
    setScore(prev => prev + (type === 'boss' ? 5 : 1));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <h2 className="text-xl font-bold text-blue-400 mb-4">乱星海捕妖</h2>
      {!isActive && timeLeft === 30 ? (
        <button onClick={() => setIsActive(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">出海捕妖</button>
      ) : (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-4 border border-slate-700 relative h-96 overflow-hidden">
          <div className="flex justify-between mb-4">
            <span className="text-slate-300">剩余时间: {timeLeft}s</span>
            <span className="text-amber-400 font-bold">捕获妖丹: {score}</span>
          </div>
          <div className="absolute inset-0 top-12 bg-blue-900/20 rounded-xl">
            {monsters.map(m => (
              <button
                key={m.id}
                onClick={() => catchMonster(m.id, m.type)}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center animate-bounce ${m.type === 'boss' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                <Swords size={20} className="text-white" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Devilfall Game Logic ---
const DevilfallGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [depth, setDepth] = useState(0);
  const [loot, setLoot] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const explore = () => {
    const risk = 0.1 + (depth * 0.05); // Risk increases with depth
    if (Math.random() < risk) {
      // Caught in spatial tear
      setGameOver(true);
      onGameOver(0); // Lose everything
    } else {
      setDepth(prev => prev + 1);
      setLoot(prev => prev + Math.floor(Math.random() * 500) + 100);
    }
  };

  const retreat = () => {
    setGameOver(true);
    onGameOver(loot);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <h2 className="text-xl font-bold text-purple-400 mb-4">坠魔谷探险</h2>
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
        {gameOver ? (
          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">{loot === 0 ? '遭遇空间裂缝，重伤而归！' : '安全撤离！'}</h3>
            <p className="text-amber-400 mb-4">获得灵石: {loot}</p>
            <button onClick={() => { setDepth(0); setLoot(0); setGameOver(false); }} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors">再次探险</button>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 mb-2">当前深度: {depth} 层</p>
            <p className="text-amber-400 font-bold mb-6">已获灵石: {loot}</p>
            <div className="flex space-x-4 justify-center">
              <button onClick={explore} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors flex items-center"><ArrowDown size={18} className="mr-2" /> 深入</button>
              {depth > 0 && (
                <button onClick={retreat} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center"><ArrowUp size={18} className="mr-2" /> 撤退</button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4">警告：越深入，遭遇空间裂缝的概率越大。一旦遭遇，将失去所有收获！</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Blood Forbidden Game Logic ---
// --- Blood Forbidden Game Logic ---
// 改造为纯战斗模式：10 个 NPC 接力 + 1 个 BOSS，技能面板常驻
const BLOOD_ENEMIES = [
  { name: '血煞门散修', isMonster: false, hpMul: 0.8, atkMul: 0.85, reward: 600, intro: '一名披血袍的散修拦在路前，喝令交出灵石。' },
  { name: '赤鳞蛇妖', isMonster: true, hpMul: 0.9, atkMul: 0.9, reward: 700, intro: '红雾中扑出一条赤鳞巨蛇，吐着腥红信子。' },
  { name: '魔道弟子', isMonster: false, hpMul: 1.0, atkMul: 1.0, reward: 900, intro: '魔道弟子双手结印，黑气缭绕逼近。' },
  { name: '九尾血狐', isMonster: true, hpMul: 1.0, atkMul: 1.05, reward: 1000, intro: '九条尾巴的血色妖狐妖瞳一闪，瞬移到你身前。' },
  { name: '夺宝狂徒', isMonster: false, hpMul: 1.1, atkMul: 1.05, reward: 1200, intro: '一柄阴森骨剑指住你咽喉——“留下储物袋，可饶不死。”' },
  { name: '噬人血蛛', isMonster: true, hpMul: 1.15, atkMul: 1.1, reward: 1300, intro: '一头数丈大的血蛛从洞穴中探出，蛛网瞬间网罩你周身。' },
  { name: '血煞执事', isMonster: false, hpMul: 1.25, atkMul: 1.15, reward: 1700, intro: '执事冷笑："禁地之中，岂容外人。"血气如刀。' },
  { name: '血煞狼王', isMonster: true, hpMul: 1.30, atkMul: 1.20, reward: 1800, intro: '狼王嚎月，周身血雾凝成虚影狼群。' },
  { name: '血煞长老', isMonster: false, hpMul: 1.45, atkMul: 1.30, reward: 2400, intro: '一位白发长老踏空而至，元婴气息如山压下。' },
  { name: '血煞妖将', isMonster: true, hpMul: 1.55, atkMul: 1.35, reward: 2800, intro: '妖将披甲持戟，戟尖一点，血煞凝成长河。' },
];
const BLOOD_BOSS = {
  name: '血煞老祖', isMonster: false, hpMul: 2.6, atkMul: 1.6, reward: 8000,
  intro: '血色法阵尽头，血煞老祖睁开双眼。一甲子魔功凝成血雨倾泻——“小辈，葬身于此罢。”',
};

const BloodForbiddenGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const {
    levelIndex, addMaterial,
    swordFormation, spiritBeast, goldDevouringBeetles, heavenlyBottle, divineSense,
  } = useStore();

  const maxHealth = 200 + levelIndex * 30;
  const [health, setHealth] = useState(maxHealth);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(0); // 0..9 普通 NPC, 10 = BOSS
  const [log, setLog] = useState<string[]>(['🩸 你踏入血色禁地，前方杀机四伏…']);
  const [gameOver, setGameOver] = useState(false);
  const [busy, setBusy] = useState(false); // 防止连点

  // 本场技能蓄量
  const [liquidCharges, setLiquidCharges] = useState(Math.max(2, Math.floor(heavenlyBottle.greenLiquid / 5)));
  const [beetleCharges, setBeetleCharges] = useState(goldDevouringBeetles.stage || 1);
  const [divineCharges, setDivineCharges] = useState(divineSense.level || 1);
  const [beastUsed, setBeastUsed] = useState(false);

  // 当前敌人
  const initEnemy = (idx: number) => {
    const def = idx >= 10 ? BLOOD_BOSS : BLOOD_ENEMIES[idx];
    const hp = Math.floor((180 + levelIndex * 30) * def.hpMul);
    return {
      name: def.name,
      hp,
      maxHp: hp,
      atk: Math.floor((14 + levelIndex * 3) * def.atkMul),
      isMonster: def.isMonster,
      isBoss: idx >= 10,
      reward: def.reward,
      armorBreak: 0,
      beetleDot: 0,
      intro: def.intro,
    };
  };
  const [enemy, setEnemy] = useState(() => initEnemy(0));

  const addLogMsg = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 6));

  // 玩家面板
  const baseAtk = 22 + levelIndex * 4;
  const swordAtk = swordFormation.swords * 2;
  const formationMult: Record<string, number> = { none: 1.0, swarm: 1.3, dragon: 1.5, net: 1.7, storm: 2.0 };
  const formationBonus = formationMult[swordFormation.formation || 'none'] || 1.0;

  // 介绍当前敌人（首次进入或换人时）
  useEffect(() => {
    addLogMsg(`⚔️ 第 ${stage + 1}/${stage >= 10 ? 11 : 11} 关 · ${enemy.name}`);
    addLogMsg(enemy.intro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy.name]);

  // ==== 敌方反击 ====
  const enemyTurn = (e: typeof enemy, currentHealth: number) => {
    let beetleDot = e.beetleDot;
    let dotDmg = 0;
    let nextEnemy = { ...e };

    if (beetleDot > 0) {
      dotDmg = Math.floor(goldDevouringBeetles.count * 0.8 + 30);
      beetleDot -= 1;
      nextEnemy = { ...e, hp: Math.max(0, e.hp - dotDmg), beetleDot };
      addLogMsg(`🪲 噬金虫啃噬，${e.name} -${dotDmg}`);
      if (nextEnemy.hp <= 0) {
        onEnemyDefeated(nextEnemy);
        return;
      }
    }

    // BOSS 高伤反击 + 偶发大招
    const isCrit = e.isBoss && Math.random() < 0.25;
    const dmg = Math.floor(nextEnemy.atk * (0.85 + Math.random() * 0.3) * (isCrit ? 1.8 : 1));
    const nextHealth = currentHealth - dmg;
    addLogMsg(`💢 ${e.name} ${isCrit ? '【血煞滔天】重击' : '反击'}你 -${dmg}`);
    setHealth(nextHealth);
    setEnemy(nextEnemy);
    setBusy(false);

    if (nextHealth <= 0) {
      addLogMsg('☠️ 你重伤倒地，被传送出禁地。');
      setGameOver(true);
      setTimeout(() => onGameOver(Math.floor(score * 0.5)), 600);
    }
  };

  // ==== 击败结算 ====
  const onEnemyDefeated = (e: typeof enemy) => {
    const reward = e.reward + (e.isBoss ? 5000 : 0);
    addLogMsg(`💀 击杀 ${e.name}！+${reward} 灵石`);
    setScore(s => s + reward);

    // 掉落
    if (Math.random() < (e.isMonster ? 0.35 : 0.55)) {
      addMaterial('rare_herb', e.isBoss ? 5 : 1);
      addLogMsg(`📦 拾得珍稀灵草 ${e.isBoss ? 5 : 1} 株`);
    }

    if (e.isBoss) {
      addLogMsg('🏆 血色禁地至深处征服！');
      setGameOver(true);
      setTimeout(() => onGameOver(score + reward), 800);
      return;
    }

    // 进入下一关，回 30% 血
    const heal = Math.floor(maxHealth * 0.3);
    setHealth(h => Math.min(maxHealth, h + heal));
    addLogMsg(`💚 短暂喘息，恢复 ${heal} 气血`);
    const nextStage = stage + 1;
    setStage(nextStage);
    setEnemy(initEnemy(nextStage));
    setBusy(false);
  };

  // ==== 技能：普攻 ====
  const skillAttack = () => {
    if (busy || gameOver) return;
    setBusy(true);
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const dmg = Math.floor((baseAtk + Math.random() * baseAtk * 0.4) * armorMult);
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`👊 普攻 -${dmg}${enemy.armorBreak > 0 ? ` (破甲x${enemy.armorBreak})` : ''}`);
    finalizeStrike(newHp);
  };

  // ==== 技能：青竹蜂云剑阵 ====
  const skillSwords = () => {
    if (busy || gameOver) return;
    if (swordFormation.swords < 1) { addLogMsg('⚠️ 尚无飞剑可用'); return; }
    setBusy(true);
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const base = (baseAtk + swordAtk) * formationBonus;
    const dmg = Math.floor(base * (0.9 + Math.random() * 0.3) * armorMult);
    const fname = ({ none: '飞剑斩', swarm: '蜂群乱舞', dragon: '游龙吞天', net: '天罗地网', storm: '剑雨风暴' } as Record<string, string>)[swordFormation.formation || 'none'];
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`⚔️ 【${fname}】(${swordFormation.swords}口) -${dmg}`);
    finalizeStrike(newHp);
  };

  // ==== 技能：噬金虫 DOT ====
  const skillBeetles = () => {
    if (busy || gameOver) return;
    if (beetleCharges <= 0) return;
    setBusy(true);
    setBeetleCharges(c => c - 1);
    const turns = 2 + goldDevouringBeetles.stage;
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const burst = Math.floor(goldDevouringBeetles.count * 1.5 * armorMult);
    const newHp = Math.max(0, enemy.hp - burst);
    addLogMsg(`🪲 投放 ${goldDevouringBeetles.count} 只噬金虫，将持续啃噬 ${turns} 回合`);
    addLogMsg(`🪲 首轮蚀骨 -${burst}`);
    if (newHp <= 0) { onEnemyDefeated({ ...enemy, hp: 0 }); return; }
    const nextE = { ...enemy, hp: newHp, beetleDot: turns };
    setEnemy(nextE);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  // ==== 技能：神识压制 ====
  const skillDivine = () => {
    if (busy || gameOver) return;
    if (divineCharges <= 0) return;
    setBusy(true);
    setDivineCharges(c => c - 1);
    const nextE = { ...enemy, armorBreak: enemy.armorBreak + 1 };
    setEnemy(nextE);
    addLogMsg(`🧠 大衍神识压制，${enemy.name} 破甲 +1（伤害 +15%）`);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  // ==== 技能：灵兽出战（终结技） ====
  const skillBeast = () => {
    if (busy || gameOver) return;
    if (beastUsed || !spiritBeast.active) return;
    const beast = spiritBeast.stabled.find(b => b.id === spiritBeast.active);
    if (!beast) return;
    setBusy(true);
    setBeastUsed(true);
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const dmg = Math.floor((baseAtk * 2.5 + beast.stage * 80) * (0.9 + Math.random() * 0.4) * armorMult);
    const beastSkillName = ({
      blood_jade_spider: '血玉蛛丝缠', wailing_beast: '啼魂夺魄', six_wing_centipede: '霜蚣冰封',
    } as Record<string, string>)[beast.id] || '灵兽撕咬';
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`🐾 ${beast.name} 施展【${beastSkillName}】 -${dmg}`);
    finalizeStrike(newHp);
  };

  // ==== 技能：翠绿灵液（回血） ====
  const skillLiquid = () => {
    if (busy || gameOver) return;
    if (liquidCharges <= 0) return;
    setBusy(true);
    setLiquidCharges(c => c - 1);
    const heal = Math.floor(maxHealth * (0.25 + heavenlyBottle.level * 0.05));
    const newHealth = Math.min(maxHealth, health + heal);
    addLogMsg(`💧 饮一口翠绿灵液，恢复 ${newHealth - health} 气血`);
    setHealth(newHealth);
    setTimeout(() => enemyTurn(enemy, newHealth), 150);
  };

  // ==== 攻击结算 ====
  const finalizeStrike = (newHp: number) => {
    if (newHp <= 0) {
      onEnemyDefeated({ ...enemy, hp: 0 });
      return;
    }
    const nextE = { ...enemy, hp: newHp };
    setEnemy(nextE);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  const skillBtn = (active: boolean, color: string, extraCls = '') =>
    `relative px-2 py-2 rounded-lg text-[11px] font-medium transition-all border ${
      active
        ? `bg-${color}-600/30 border-${color}-500/50 text-${color}-100 hover:bg-${color}-600/50 shadow-[0_0_8px_rgba(0,0,0,0.3)]`
        : 'bg-slate-800/40 border-slate-700/40 text-slate-600 cursor-not-allowed'
    } ${extraCls}`;

  return (
    <div className="flex flex-col items-center justify-start p-3 h-full overflow-y-auto">
      <div className="w-full max-w-md bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 rounded-2xl p-4 border border-rose-900/40 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
        {gameOver ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-bold text-rose-300 mb-2">血色禁地试炼结束</h3>
            <p className="text-amber-400 mb-4 text-sm">总收益: {score} 灵石</p>
            <p className="text-slate-400 text-xs">通过关卡：{Math.min(stage, 11)} / 11</p>
          </div>
        ) : (
          <>
            {/* 关卡进度条 */}
            <div className="flex items-center justify-between mb-2 text-[10px]">
              <span className="text-rose-300/70">关卡进度</span>
              <span className="text-amber-400 font-mono">{stage + 1} / 11</span>
            </div>
            <div className="grid grid-cols-11 gap-0.5 mb-3">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-sm ${
                  i < stage ? 'bg-emerald-500'
                    : i === stage ? (stage === 10 ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-pulse')
                    : 'bg-slate-800'
                }`} />
              ))}
            </div>

            {/* 双方状态 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* 玩家 */}
              <div className="bg-slate-900/70 rounded-xl p-2 border border-emerald-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-300 font-bold text-xs">🧑 你</span>
                  <span className="text-[9px] text-emerald-400/60">攻 {baseAtk}</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                    style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">{Math.max(0, Math.floor(health))} / {maxHealth}</div>
              </div>
              {/* 敌人 */}
              <div className={`bg-slate-900/70 rounded-xl p-2 border ${enemy.isBoss ? 'border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'border-rose-700/40'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${enemy.isBoss ? 'text-amber-300' : 'text-rose-300'}`}>
                    {enemy.isBoss ? '👑' : enemy.isMonster ? '👹' : '🗡️'} {enemy.name}
                  </span>
                  <span className="text-[9px] text-rose-400/60">攻 {enemy.atk}</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${enemy.isBoss ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-rose-200/70">{Math.max(0, enemy.hp)} / {enemy.maxHp}</span>
                  <div className="flex space-x-1">
                    {enemy.armorBreak > 0 && (
                      <span className="text-[8px] px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">破{enemy.armorBreak}</span>
                    )}
                    {enemy.beetleDot > 0 && (
                      <span className="text-[8px] px-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🪲{enemy.beetleDot}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 顶部计分 */}
            <div className="flex justify-between mb-2 text-[10px]">
              <span className="text-amber-400">💎 {score} 灵石</span>
              <span className="text-slate-400">气血上限 {maxHealth}</span>
            </div>

            {/* 技能面板（常驻） */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button onClick={skillAttack} disabled={busy} className={skillBtn(!busy, 'slate')}>
                <div>👊 普攻</div>
                <div className="text-[9px] opacity-60">{baseAtk}</div>
              </button>
              <button onClick={skillSwords} disabled={busy || swordFormation.swords < 1}
                className={skillBtn(!busy && swordFormation.swords >= 1, 'cyan')}>
                <div>⚔️ 剑阵</div>
                <div className="text-[9px] opacity-60">{swordFormation.swords}口×{formationBonus}</div>
              </button>
              <button onClick={skillBeetles} disabled={busy || beetleCharges <= 0}
                className={skillBtn(!busy && beetleCharges > 0, 'yellow')}>
                <div>🪲 噬金虫</div>
                <div className="text-[9px] opacity-60">{beetleCharges > 0 ? `剩 ${beetleCharges}` : '已用'}</div>
              </button>
              <button onClick={skillDivine} disabled={busy || divineCharges <= 0}
                className={skillBtn(!busy && divineCharges > 0, 'purple')}>
                <div>🧠 神识</div>
                <div className="text-[9px] opacity-60">{divineCharges > 0 ? `剩 ${divineCharges}` : '已用'}</div>
              </button>
              <button onClick={skillBeast} disabled={busy || beastUsed || !spiritBeast.active}
                className={skillBtn(!busy && !beastUsed && !!spiritBeast.active, 'teal')}>
                <div>🐾 灵兽</div>
                <div className="text-[9px] opacity-60">
                  {!spiritBeast.active ? '未派' : beastUsed ? '已用' : '终结技'}
                </div>
              </button>
              <button onClick={skillLiquid} disabled={busy || liquidCharges <= 0}
                className={skillBtn(!busy && liquidCharges > 0, 'emerald')}>
                <div>💧 灵液</div>
                <div className="text-[9px] opacity-60">{liquidCharges > 0 ? `剩 ${liquidCharges}` : '已用'}</div>
              </button>
            </div>

            {/* 战斗日志 */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 h-32 overflow-y-auto text-left text-[11px] space-y-1 border border-slate-700/40">
              {log.map((msg, idx) => (
                <p key={idx} className={idx === 0 ? 'text-slate-100 font-medium' : 'text-slate-500'}>{msg}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Kunwu Game Logic ---
const KunwuGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const { levelIndex, bonusPoints, equippedArtifacts, artifactLevels } = useStore();
  
  // Calculate player stats based on cultivation
  const baseHealth = 100 + levelIndex * 50;
  const baseDmg = 10 + levelIndex * 5;
  
  // Apply artifact bonuses
  const hasSword = equippedArtifacts.includes('ancient_sword');
  const swordLevel = hasSword ? (artifactLevels['ancient_sword'] || 1) : 0;
  const dmgBonus = hasSword ? 1 + (0.2 + swordLevel * 0.05) : 1;
  
  const hasShield = equippedArtifacts.includes('shield_artifact');
  const shieldLevel = hasShield ? (artifactLevels['shield_artifact'] || 1) : 0;
  const defBonus = hasShield ? 1 - (0.1 + shieldLevel * 0.05) : 1;

  const [health, setHealth] = useState(baseHealth);
  const [bossHealth, setBossHealth] = useState(500);
  const [kunwuStones, setKunwuStones] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const attack = () => {
    const dmg = Math.floor((Math.random() * 20 + baseDmg) * dmgBonus);
    const bossDmg = Math.floor((Math.random() * 15 + 5 + kunwuStones * 2) * defBonus);

    // 用本地变量先算清楚，避免 setState 异步导致的判定错位
    const nextBossHp = Math.max(0, bossHealth - dmg);
    let nextStones = kunwuStones;
    let nextHealth = Math.max(0, health - bossDmg);
    let nextBossMax = 500 + nextStones * 50;

    if (nextBossHp <= 0) {
      nextStones = kunwuStones + 5;
      nextBossMax = 500 + nextStones * 50;
      // 杀 boss 时回 20% 血，但不超过上限
      nextHealth = Math.min(baseHealth, nextHealth + baseHealth * 0.2);
      setBossHealth(nextBossMax);
    } else {
      setBossHealth(nextBossHp);
    }

    setHealth(nextHealth);
    setKunwuStones(nextStones);

    if (nextHealth <= 0) {
      setGameOver(true);
      onGameOver(nextStones * 5000);
    }
  };

  const retreat = () => {
    setGameOver(true);
    onGameOver(kunwuStones * 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <h2 className="text-xl font-bold text-amber-400 mb-4">昆吾山斗法</h2>
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
        {gameOver ? (
          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">斗法结束</h3>
            <p className="text-amber-400 mb-4">获得昆吾石: {kunwuStones} (折合 {kunwuStones * 5000} 灵石)</p>
            <button onClick={() => { setHealth(baseHealth); setBossHealth(500); setKunwuStones(0); setGameOver(false); }} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors">再次登山</button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-4">
              <div className="text-left">
                <p className="text-emerald-400 font-bold">你的气血: {Math.floor(health)} / {baseHealth}</p>
                <div className="w-24 h-2 bg-slate-900 rounded-full mt-1"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, (health/baseHealth)*100)}%` }} /></div>
              </div>
              <div className="text-right">
                <p className="text-rose-400 font-bold">古魔气血: {Math.floor(bossHealth)}</p>
                <div className="w-24 h-2 bg-slate-900 rounded-full mt-1 ml-auto"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.max(0, (bossHealth/(500 + kunwuStones * 50))*100)}%` }} /></div>
              </div>
            </div>
            <p className="text-amber-400 font-bold mb-6">已获昆吾石: {kunwuStones}</p>
            <div className="flex space-x-4 justify-center">
              <button onClick={attack} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors flex items-center"><Swords size={18} className="mr-2" /> 攻击</button>
              <button onClick={retreat} className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-colors flex items-center"><ArrowLeft size={18} className="mr-2" /> 撤退</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 符箓绘制游戏 ============
const TALISMAN_PATTERNS = [
  { name: '火弹符', seq: [0, 1, 2, 1, 0], reward: 30, color: 'text-red-400' },
  { name: '金刚符', seq: [2, 1, 0, 1, 2], reward: 50, color: 'text-amber-400' },
  { name: '神行符', seq: [0, 2, 1, 0, 2], reward: 80, color: 'text-cyan-400' },
];

const TalismanDrawGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [pattern, setPattern] = useState(TALISMAN_PATTERNS[Math.floor(Math.random() * TALISMAN_PATTERNS.length)]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (showing) {
      const t = setTimeout(() => setShowing(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showing, pattern]);

  const draw = (pos: number) => {
    if (showing || drawing) return;
    setDrawing(true);
    const newSeq = [...playerSeq, pos];
    setPlayerSeq(newSeq);

    if (newSeq.length === pattern.seq.length) {
      const correct = newSeq.every((p, i) => p === pattern.seq[i]);
      setTimeout(() => {
        if (correct) {
          const newScore = score + pattern.reward;
          setScore(newScore);
          if (round >= 5) onGameOver(newScore);
          else {
            setPattern(TALISMAN_PATTERNS[Math.floor(Math.random() * TALISMAN_PATTERNS.length)]);
            setPlayerSeq([]);
            setRound(round + 1);
            setShowing(true);
          }
        } else {
          onGameOver(score);
        }
        setDrawing(false);
      }, 500);
    } else {
      setDrawing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
      <p className="text-xs text-slate-400 mb-4">记忆符文序列，依次点击符文节点</p>
      <div className="flex space-x-2 mb-4">
        <span className="text-xs text-slate-500">第 {round + 1}/6 张</span>
        <span className={`text-xs font-bold ${pattern.color}`}>{pattern.name}</span>
        <span className="text-xs text-amber-400">{score} 灵石</span>
      </div>

      {/* Pattern display */}
      <div className="flex space-x-4 mb-6">
        {pattern.seq.map((node, i) => (
          <motion.div key={i}
            animate={showing ? { scale: [1, 1.3, 1], boxShadow: ['0 0 0px rgba(251,191,36,0)', '0 0 20px rgba(251,191,36,0.5)', '0 0 0px rgba(251,191,36,0)'] } : {}}
            transition={{ duration: 0.5, delay: i * 0.3 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 ${
              showing ? 'border-amber-400/50 bg-amber-500/20 text-amber-300' : 'border-slate-700 bg-slate-800 text-slate-600'
            }`}>
            {showing ? ['火', '金', '风'][node] : '?'}
          </motion.div>
        ))}
      </div>

      {/* Player input */}
      <div className="flex space-x-4 mb-4">
        {[0, 1, 2].map(pos => (
          <motion.button key={pos} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => draw(pos)}
            disabled={showing}
            className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-600 hover:border-amber-400/50 text-white text-lg font-bold disabled:opacity-30 flex flex-col items-center justify-center">
            <span>{['🔥', '🛡️', '💨'][pos]}</span>
            <span className="text-[8px] text-slate-500">{['火', '金', '风'][pos]}</span>
          </motion.button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex space-x-1">
        {pattern.seq.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < playerSeq.length ? 'bg-amber-400' : 'bg-slate-700'}`} />
        ))}
      </div>
    </motion.div>
  );
};

// ============ 灵石矿脉游戏 ============
const SpiritMineGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const [mined, setMined] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) { onGameOver(mined); return; }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const mine = () => {
    if (timeLeft <= 0) return;
    setMined(m => m + clickPower);
    setStreak(s => s + 1);
    if (streak > 0 && streak % 10 === 0) setClickPower(p => p + 1);
    setCombo(Date.now());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
      <p className="text-xs text-slate-400 mb-4">疯狂点击开采灵石！连击提升开采效率</p>

      <div className="flex items-center space-x-4 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-500">剩余时间</div>
          <motion.div animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-2xl font-bold text-amber-400">{timeLeft}s</motion.div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500">开采量</div>
          <motion.div key={mined} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.2 }}
            className="text-2xl font-bold text-cyan-400">{mined}</motion.div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500">效率</div>
          <div className="text-lg font-bold text-emerald-400">x{clickPower}</div>
        </div>
      </div>

      {/* Ore vein */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={mine}
        className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-900 via-slate-800 to-amber-900 border-4 border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_60px_rgba(6,182,212,0.2)] relative overflow-hidden"
      >
        <motion.div animate={Date.now() - combo < 200 ? { scale: [1, 1.1, 1] } : {}}
          className="text-center">
          <Gem size={48} className="text-cyan-400 mx-auto mb-2" />
          <span className="text-xs text-cyan-300 font-bold">点击开采！</span>
        </motion.div>
        {/* Spark particles on click */}
        {Date.now() - combo < 200 && Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 120, opacity: 0 }}
            transition={{ duration: 0.4 }} />
        ))}
      </motion.button>

      {/* Streak indicator */}
      {streak > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-amber-400">
          连击 x{streak} {streak > 10 ? '🔥' : ''}
        </motion.div>
      )}
    </motion.div>
  );
};

// 卡片 UI 元数据：emoji 当主图，theme 用作渐变/边框配色
const GAME_LIST = [
  { id: 'meditation', name: '闭关修炼', emoji: '🧘', theme: 'sky', desc: '静心打坐，获取修为', minLevel: 0 },
  { id: '2048', name: '两仪微尘阵', emoji: '☯', theme: 'emerald', desc: '推演阵法变化，获取灵石', minLevel: 0 },
  { id: 'snake', name: '灵蛇吐息', emoji: '🐍', theme: 'rose', desc: '操控灵蛇吞噬灵气', minLevel: 2000 },
  { id: 'alchemy', name: '炼丹模拟', emoji: '🔥', theme: 'amber', desc: '控制火候，炼制仙丹', minLevel: 10000 },
  { id: 'memory', name: '虚天殿寻宝', emoji: '💎', theme: 'indigo', desc: '记忆翻牌，寻找宝物', minLevel: 30000 },
  { id: 'blood_forbidden', name: '血色禁地', emoji: '🩸', theme: 'red', desc: '危险区域，可能遭遇夺宝', minLevel: 100000 },
  { id: 'talisman_draw', name: '符箓绘制', emoji: '📜', theme: 'amber', desc: '描绘符文，绘制强力符箓', minLevel: 30000 },
  { id: 'spirit_mine', name: '灵石矿脉', emoji: '⛏', theme: 'cyan', desc: '开采灵石矿脉', minLevel: 10000 },
  { id: 'monster_hunt', name: '乱星海捕妖', emoji: '🌊', theme: 'blue', desc: '出海捕杀妖兽，获取妖丹', minLevel: 1000000 },
  { id: 'devilfall', name: '坠魔谷探险', emoji: '🕳', theme: 'purple', desc: '深入坠魔谷，寻找上古遗宝', minLevel: 2000000 },
  { id: 'kunwu', name: '昆吾山斗法', emoji: '⛰', theme: 'amber', desc: '攀登昆吾山，开采昆吾石', minLevel: 5000000 },
  { id: 'demon_abyss', name: '魔渊', emoji: '🩸', theme: 'red', desc: '魔气潮汐周期开启 · 三魔轮替', minLevel: 50000 },
];

const THEME_STYLES: Record<string, { bg: string; border: string; glow: string; text: string; accent: string; icon: string }> = {
  sky:     { bg: 'from-sky-900/40 to-slate-900',     border: 'border-sky-700/40',     glow: 'shadow-[0_0_30px_rgba(56,189,248,0.15)]',  text: 'text-sky-300',     accent: 'bg-sky-500/15',     icon: 'text-sky-400' },
  emerald: { bg: 'from-emerald-900/40 to-slate-900', border: 'border-emerald-700/40', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',  text: 'text-emerald-300', accent: 'bg-emerald-500/15', icon: 'text-emerald-400' },
  rose:    { bg: 'from-rose-900/40 to-slate-900',    border: 'border-rose-700/40',    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',   text: 'text-rose-300',    accent: 'bg-rose-500/15',    icon: 'text-rose-400' },
  amber:   { bg: 'from-amber-900/40 to-slate-900',   border: 'border-amber-700/40',   glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]',  text: 'text-amber-300',   accent: 'bg-amber-500/15',   icon: 'text-amber-400' },
  indigo:  { bg: 'from-indigo-900/40 to-slate-900',  border: 'border-indigo-700/40',  glow: 'shadow-[0_0_30px_rgba(129,140,248,0.15)]', text: 'text-indigo-300',  accent: 'bg-indigo-500/15',  icon: 'text-indigo-400' },
  red:     { bg: 'from-red-900/50 to-slate-900',     border: 'border-red-700/40',     glow: 'shadow-[0_0_30px_rgba(239,68,68,0.18)]',   text: 'text-red-300',     accent: 'bg-red-500/15',     icon: 'text-red-400' },
  cyan:    { bg: 'from-cyan-900/40 to-slate-900',    border: 'border-cyan-700/40',    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]',  text: 'text-cyan-300',    accent: 'bg-cyan-500/15',    icon: 'text-cyan-400' },
  blue:    { bg: 'from-blue-900/40 to-slate-900',    border: 'border-blue-700/40',    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',  text: 'text-blue-300',    accent: 'bg-blue-500/15',    icon: 'text-blue-400' },
  purple:  { bg: 'from-purple-900/40 to-slate-900',  border: 'border-purple-700/40',  glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',  text: 'text-purple-300',  accent: 'bg-purple-500/15',  icon: 'text-purple-400' },
};

// 老 React 游戏统一卡头：标题 + 副标题 + emoji 装饰
// Phaser 游戏的 wrapper 不再单独显标题，由这里的 GameSceneHeader 统一接管
function GameSceneHeader({ gameId }: { gameId: string }) {
  const meta = GAME_LIST.find(g => g.id === gameId);
  if (!meta) return null;
  const t = THEME_STYLES[meta.theme] || THEME_STYLES.amber;
  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl border bg-gradient-to-r ${t.bg} ${t.border} ${t.glow} overflow-hidden`}
      style={{ fontFamily: '"Noto Serif SC", serif' }}
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${t.accent} blur-2xl opacity-50 pointer-events-none`} />
      <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl ${t.accent} border ${t.border} flex items-center justify-center text-2xl`}>
        {meta.emoji}
      </div>
      <div className="relative">
        <h2 className={`text-lg ${t.text} tracking-widest`} style={{ fontWeight: 600 }}>{meta.name}</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">{meta.desc}</p>
      </div>
    </div>
  );
}

// 战前简报：展示装备/功法/最高分等"实力配置"信息
const ARTIFACT_NAMES: Record<string, { name: string; desc: (lv: number) => string }> = {
  ancient_sword: { name: '上古残剑', desc: (lv) => `灵石收益 +${20 + (lv - 1) * 5}% / 攻击 +${20 + (lv - 1) * 5}%` },
  shield_artifact: { name: '玄铁盾', desc: (lv) => `减伤 ${10 + (lv - 1) * 5}%` },
  artifact_2: { name: '八卦镜', desc: (lv) => `魔兵速度 -${25 * lv}%` },
  artifact_1: { name: '掌天瓶(伪)', desc: () => `每秒被动治疗界面之心` },
  julian_array: { name: '聚灵阵', desc: (lv) => `饮水修为 +${30 + (lv - 1) * 10}%` },
};
const SKILL_NAMES: Record<string, string> = {
  skill_1: '青元剑诀',
  skill_2: '玄阴诀',
  skill_3: '五行诀',
  skill_4: '长生诀',
  skill_5: '天雷双剑',
};

function BattleBriefing({
  gameId, levelName, equippedArtifacts, artifactLevels, skills, equippedSkills, myHigh, onGoCave,
}: {
  gameId: string;
  levelName: string;
  equippedArtifacts: string[];
  artifactLevels: Record<string, number>;
  skills: string[];
  equippedSkills: string[];
  myHigh: number;
  onGoCave: () => void;
}) {
  const meta = GAME_LIST.find(g => g.id === gameId);
  if (!meta) return null;
  const t = THEME_STYLES[meta.theme] || THEME_STYLES.amber;

  const equippedArts = equippedArtifacts.filter(id => ARTIFACT_NAMES[id]);
  const skillsForCombat = (equippedSkills.length ? equippedSkills : skills).filter(id => SKILL_NAMES[id]);

  // 是否为对战类游戏（用功法/装备的）
  const isCombatGame = ['kunwu', 'monster_hunt', 'devilfall', 'demon_abyss', 'blood_forbidden'].includes(gameId);

  return (
    <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
         style={{ fontFamily: '"Noto Serif SC", serif' }}>
      <div className={`px-3 py-2 border-b border-slate-700/40 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-[11px] tracking-widest text-slate-300">
          <Scroll size={12} className={t.icon} />
          战前简报
        </div>
        <div className="text-[10px] text-slate-500">{levelName}</div>
      </div>
      <div className="p-3 space-y-2 text-[11px] leading-relaxed">
        {/* 法宝 */}
        {isCombatGame && (
          <div>
            <div className="text-slate-500 mb-1">法宝加成</div>
            {equippedArts.length === 0 ? (
              <button onClick={onGoCave} className="text-slate-400 hover:text-amber-300 underline-offset-2 hover:underline transition-colors text-left">
                未装备法宝。<span className="text-amber-400">前往洞府装备 →</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {equippedArts.map(id => {
                  const def = ARTIFACT_NAMES[id];
                  const lv = artifactLevels[id] || 1;
                  return (
                    <div key={id} className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-amber-300 font-bold">{def.name}</span>
                      <span className="text-amber-400/70 text-[10px] ml-1">Lv.{lv}</span>
                      <div className="text-amber-200/60 text-[10px]">{def.desc(lv)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 功法（仅魔界入侵真正使用，但其他场景也展示当作 flavor） */}
        {isCombatGame && (
          <div>
            <div className="text-slate-500 mb-1">已习功法</div>
            {skillsForCombat.length === 0 ? (
              <button onClick={onGoCave} className="text-slate-400 hover:text-emerald-300 underline-offset-2 hover:underline transition-colors text-left">
                尚未学得功法。<span className="text-emerald-400">前往坊市求购 →</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skillsForCombat.map(id => (
                  <div key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    {SKILL_NAMES[id]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 个人最高分 + 修为门槛 */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <div>
            <span className="text-slate-500">本机最高 </span>
            <span className="text-amber-300 font-bold">{myHigh > 0 ? myHigh.toLocaleString() : '—'}</span>
          </div>
          {meta.minLevel && meta.minLevel > 0 && (
            <div>
              <span className="text-slate-500">推荐修为 </span>
              <span className="text-slate-300">{meta.minLevel.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




export default function GamesPage() {
  const navigate = useNavigate();
  const { activeGame, setActiveGame, updateQuestProgress, addSpiritStones, logs, bonusPoints, inventory, spiritualRoot, resetCultivation, createdAt, spiritStones, realmExplorationTotal, equippedArtifacts, artifactLevels, skills, equippedSkills, levelIndex } = useStore();
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [deathModal, setDeathModal] = useState<boolean>(false);
  const [lostStones, setLostStones] = useState<number>(0);
  const [encounter, setEncounter] = useState<{ game: any; gap: number } | null>(null);
  const [encounterLog, setEncounterLog] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>(() => getAllLocalHighScores());
  const [newRecord, setNewRecord] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(() => isMuted());
  const [demonAbyssOpen, setDemonAbyssOpen] = useState<boolean>(false);

  // 订阅外部 mute 变化（其他页面切换时同步）
  useEffect(() => subscribeMute(setAudioMuted), []);

  useEffect(() => {
    updateQuestProgress('game', 1);
  }, [updateQuestProgress]);

  const handleGameOver = (score: number) => {
    // Reward spirit stones based on score
    let reward = 0;
    let risk: 'low' | 'mid' | 'high' = 'low';
    
    if (activeGame === '2048') {
      reward = Math.floor(score / 100);
      if (score > 2000) risk = 'high';
      else if (score > 1000) risk = 'mid';
    } else if (activeGame === 'snake') {
      reward = Math.floor(score / 20);
      if (score > 200) risk = 'high';
      else if (score > 100) risk = 'mid';
    } else if (activeGame === 'alchemy') {
      reward = Math.floor(score / 10);
      if (score > 100) risk = 'high';
      else if (score > 50) risk = 'mid';
    } else if (activeGame === 'memory') {
      reward = Math.floor(score / 5);
      if (score > 50) risk = 'high';
      else if (score > 25) risk = 'mid';
    } else if (activeGame === 'monster_hunt') {
      reward = Math.floor(score);
      if (score > 500) risk = 'high';
      else if (score > 200) risk = 'mid';
    } else if (activeGame === 'devilfall') {
      reward = score;
      if (score > 1000) risk = 'high';
      else if (score > 500) risk = 'mid';
    } else if (activeGame === 'kunwu') {
      reward = score;
      if (score > 50000) risk = 'high';
      else if (score > 20000) risk = 'mid';
    } else if (activeGame === 'blood_forbidden') {
      reward = score;
      if (score > 5000) risk = 'high';
      else if (score > 2000) risk = 'mid';
    }
    
    if (reward > 0) {
      // Apply ancient_sword bonus
      const state = useStore.getState();
      if (state.equippedArtifacts.includes('ancient_sword')) {
        const level = state.artifactLevels['ancient_sword'] || 1;
        reward = Math.floor(reward * (1 + 0.2 + (level - 1) * 0.05));
      }
      
      addSpiritStones(reward);
      
      // Trigger realm exploration rewards
      const result = useStore.getState().exploreRealm(risk);
      let dropMessage = '';
      
      if (result && result.type !== 'limit') {
        if (result.type === 'herb') {
          useStore.getState().addMaterial('common_herb', result.amount);
          dropMessage = `，并发现普通灵草x${result.amount}`;
        } else if (result.type === 'rare_herb') {
          useStore.getState().addMaterial('rare_herb', result.amount);
          dropMessage = `，并发现珍稀灵草x${result.amount}`;
        } else if (result.type === 'stone') {
          useStore.getState().addMaterial('stone', result.amount);
          dropMessage = `，并开采灵矿石x${result.amount}`;
        } else if (result.type === 'profound_iron') {
          useStore.getState().addMaterial('profound_iron', result.amount);
          dropMessage = `，并获得玄铁精x${result.amount}`;
        } else if (result.type === 'millennium_lingzhi') {
          useStore.getState().addMaterial('millennium_lingzhi', result.amount);
          dropMessage = `，并获得千年灵芝x${result.amount}`;
        } else if (result.type === 'jiuzhuan_grass') {
          useStore.getState().addMaterial('jiuzhuan_grass', result.amount);
          dropMessage = `，并获得九转玄草x${result.amount}`;
        } else if (result.type === 'hidden_cave') {
          dropMessage = `，并误入隐藏洞府，获得${result.reward}！`;
        } else if (result.type === 'pill') {
          useStore.getState().addMaterial(result.itemId, result.amount);
          const pillName = result.itemId === 'pill_1' ? '黄龙丹' : result.itemId === 'pill_foundation' ? '筑基丹' : '降尘丹';
          dropMessage = `，并获得丹药：${pillName}x${result.amount}`;
        } else if (result.type === 'skill') {
          useStore.getState().learnSkill(result.itemId);
          const skillName = result.itemId === 'skill_3' ? '五行诀' : '天雷双剑';
          dropMessage = `，并获得功法传承：《${skillName}》`;
        } else if (result.type === 'inheritance') {
          useStore.setState(state => ({ bonusPoints: (isNaN(state.bonusPoints) ? 0 : state.bonusPoints) + result.exp }));
          dropMessage = `，${result.reward}`;
        } else if (result.type === 'monster') {
          // Penalty handled in store or here? Store just returns penalty.
          // Let's just say they escaped.
          dropMessage = `，但遭遇妖兽，惊险逃脱`;
        }
      }
      
      setRewardToast(`${reward} 灵石${dropMessage}`);
      setTimeout(() => setRewardToast(null), 4000);
    }

    // 提交分数到排行榜（不阻塞流程）
    if (activeGame && score > 0) {
      submitScore(activeGame, score);
      // 本地最高分
      if (updateLocalHighScore(activeGame, score)) {
        setHighScores(getAllLocalHighScores());
        setNewRecord(activeGame);
        setTimeout(() => setNewRecord(null), 3500);
      }
    }
  };

  let passiveMultiplier = 1;
  if (inventory?.includes('book_1')) passiveMultiplier *= 1.2;
  if (inventory?.includes('artifact_1')) passiveMultiplier *= 2.0;
  const rootInfo = SPIRITUAL_ROOTS.find(r => r.id === spiritualRoot);
  if (rootInfo) {
    passiveMultiplier *= rootInfo.bonus;
  }
  const totalAmount = logs.reduce((sum, l) => sum + l.amount * passiveMultiplier, 0) + bonusPoints;

  const handleGameClick = (game: any) => {
    if ((game as any).locked) return;

    // 魔渊：单独处理（走自己的 host 而非 setActiveGame）
    if (game.id === 'demon_abyss') {
      setDemonAbyssOpen(true);
      return;
    }

    const isLevelLocked = game.minLevel !== undefined && totalAmount < game.minLevel;
    if (isLevelLocked) {
      const isProtected = Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000;

      if (isProtected) {
        // 新人保护期：直接放行但留个提示
        setActiveGame(game.id);
        return;
      }
      // 触发"遭遇"对话框，玩家可选择硬闯 / 绕路 / 隐匿
      const gap = (game.minLevel || 1) / Math.max(totalAmount, 1);
      setEncounter({ game, gap });
      return;
    }

    setActiveGame(game.id);
  };

  // gap = 推荐修为 / 当前修为，>1 表示越级，越大越危险
  const resolveEncounter = (action: 'fight' | 'detour' | 'stealth') => {
    if (!encounter) return;
    const { game, gap } = encounter;
    const swordLv = equippedArtifacts.includes('ancient_sword') ? (artifactLevels['ancient_sword'] || 1) : 0;
    const shieldLv = equippedArtifacts.includes('shield_artifact') ? (artifactLevels['shield_artifact'] || 1) : 0;
    // 装备/灵根加成 → 0..1 的"成功偏移"
    const gearBoost = swordLv * 0.04 + shieldLv * 0.03;
    const rootBoost = (rootInfo?.bonus ?? 1) > 1 ? 0.05 : 0;
    // 越级越难，gap=1 时为基准
    const danger = Math.min(1, Math.log10(Math.max(gap, 1)) / 2);

    if (action === 'fight') {
      // 硬闯：直接进入游戏，但若失败概率（与 danger 成正比）触发重伤减半灵石
      const successP = Math.max(0.15, 1 - danger - 0.15) + gearBoost;
      if (Math.random() < successP) {
        setEncounterLog(`你正面击退了拦路修士，强闯进入【${game.name}】！`);
        setTimeout(() => {
          setEncounterLog(null);
          setEncounter(null);
          setActiveGame(game.id);
        }, 1200);
      } else {
        const lost = Math.floor((spiritStones || 0) * 0.4);
        addSpiritStones(-lost);
        setLostStones(lost);
        setEncounter(null);
        setEncounterLog(null);
        setDeathModal(true);
      }
    } else if (action === 'detour') {
      // 绕路：100% 安全但什么都没发生，给点修为补偿
      setEncounterLog('你选择绕道而行，虽未进入秘境，但途中静修小有所得。');
      setTimeout(() => {
        setEncounterLog(null);
        setEncounter(null);
      }, 1500);
    } else {
      // 隐匿：隐藏身份溜进去；成功率比硬闯低，但失败只损失 10%
      const successP = Math.max(0.1, 0.7 - danger * 0.8) + rootBoost + gearBoost * 0.5;
      if (Math.random() < successP) {
        setEncounterLog(`你隐匿气息，悄然潜入【${game.name}】，未被任何修士察觉。`);
        setTimeout(() => {
          setEncounterLog(null);
          setEncounter(null);
          setActiveGame(game.id);
        }, 1200);
      } else {
        const lost = Math.floor((spiritStones || 0) * 0.1);
        addSpiritStones(-lost);
        setLostStones(lost);
        setEncounterLog(`隐匿失败，被巡视的修士察觉，仓皇逃窜中遗落 ${lost} 灵石。`);
        setTimeout(() => {
          setEncounterLog(null);
          setEncounter(null);
        }, 1800);
      }
    }
  };

  return (
    <div
      className="p-6 max-w-md mx-auto pb-32 min-h-full flex flex-col"
      style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl tracking-[0.25em] text-slate-100 flex items-center" style={{ fontWeight: 600 }}>
          <Trophy className="mr-2 text-amber-400" /> 秘境历练
        </h1>
        <button
          onClick={() => toggleMuted()}
          className={`p-2 rounded-full border transition-colors ${
            audioMuted
              ? 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title={audioMuted ? '已静音 · 点击开启音效' : '点击关闭音效'}
        >
          {audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      
      <p className="text-xs text-slate-400 mb-4 bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700/50">
        道友，修仙路漫漫，劳逸结合方能证得大道。在秘境中历练可获取灵石，用于坊市交易。若强行进入高阶秘境，极易被杀人夺宝，修为尽失！🎮
      </p>

      <div className="mb-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-300 flex items-center">
            <Compass size={16} className="mr-2 text-emerald-400" />
            秘境探索度
          </span>
          <span className="text-xs text-emerald-400 font-mono">{realmExplorationTotal} / 20</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
            style={{ width: `${Math.min(100, (realmExplorationTotal / 20) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span className={realmExplorationTotal >= 5 ? 'text-amber-400' : ''}>5: 隐藏洞府</span>
          <span className={realmExplorationTotal >= 10 ? 'text-amber-400' : ''}>10: 专属称号</span>
          <span className={realmExplorationTotal >= 20 ? 'text-amber-400' : ''}>20: 首领挑战</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div 
            key="game-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <button
              onClick={() => setActiveGame(null)}
              className="mb-4 flex items-center text-slate-400 hover:text-slate-200 text-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> 返回秘境大厅
            </button>
            {activeGame && (
              <LeaderboardPanel
                gameId={activeGame}
                gameName={GAME_LIST.find(g => g.id === activeGame)?.name || activeGame}
              />
            )}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {activeGame && <GameSceneHeader gameId={activeGame} />}
              {activeGame && (
                <BattleBriefing
                  gameId={activeGame}
                  levelName={CULTIVATION_LEVELS[levelIndex]?.name || '凡人'}
                  equippedArtifacts={equippedArtifacts}
                  artifactLevels={artifactLevels}
                  skills={skills}
                  equippedSkills={equippedSkills}
                  myHigh={highScores[activeGame] || 0}
                  onGoCave={() => navigate('/cave')}
                />
              )}
              {activeGame === '2048' && <Game2048 onGameOver={handleGameOver} />}
              {activeGame === 'snake' && <SnakeGame onGameOver={handleGameOver} />}
              {activeGame === 'alchemy' && <AlchemyGame onGameOver={handleGameOver} />}
              {activeGame === 'memory' && <MemoryGame onGameOver={handleGameOver} />}
              {activeGame === 'meditation' && <MeditationGame onGameOver={handleGameOver} />}
              {activeGame === 'monster_hunt' && (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-400">扬帆出海...</p>
                  </div>
                }>
                  <MonsterHuntPhaserGame onGameOver={handleGameOver} />
                </Suspense>
              )}
              {activeGame === 'devilfall' && (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-400">坠入魔谷...</p>
                  </div>
                }>
                  <DevilfallPhaserGame onGameOver={handleGameOver} />
                </Suspense>
              )}
              {activeGame === 'kunwu' && (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-400">召唤昆吾山幻境...</p>
                  </div>
                }>
                  <KunwuPhaserGame onGameOver={handleGameOver} />
                </Suspense>
              )}
              {activeGame === 'blood_forbidden' && <BloodForbiddenGame onGameOver={handleGameOver} />}
              {activeGame === 'talisman_draw' && <TalismanDrawGame onGameOver={handleGameOver} />}
              {activeGame === 'spirit_mine' && <SpiritMineGame onGameOver={handleGameOver} />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col"
          >
            <HallTopBoard games={GAME_LIST.map(g => ({ id: g.id, name: g.name }))} />
            <div className="grid grid-cols-2 gap-3">
            {GAME_LIST.map(game => {
              const isLevelLocked = game.minLevel !== undefined && totalAmount < game.minLevel;
              const isLocked = (game as any).locked;
              const myHigh = highScores[game.id] || 0;
              const t = THEME_STYLES[game.theme] || THEME_STYLES.amber;

              if (isLocked) {
                return (
                  <div key={game.id} className="flex flex-col items-center p-4 rounded-2xl border bg-slate-800/30 border-slate-800 opacity-50">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 mb-2 flex items-center justify-center">
                      <Lock size={20} className="text-slate-600" />
                    </div>
                    <h3 className="text-xs text-slate-500">{game.name}</h3>
                    <p className="text-[10px] text-slate-600 mt-1">即将开启</p>
                  </div>
                );
              }

              if (isLevelLocked) {
                // 封印卷轴样式：红色绑带 + 锁
                return (
                  <button
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className="group relative flex flex-col items-center p-4 rounded-2xl border bg-gradient-to-b from-red-950/40 to-slate-900 border-red-900/50 hover:border-red-700 hover:from-red-900/60 active:scale-95 transition-all overflow-hidden"
                  >
                    {/* 暗红封印纹路 */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(239,68,68,0.15) 8px 9px)' }} />
                    <div className="relative w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/50 mb-2 flex items-center justify-center">
                      <span className="text-2xl grayscale opacity-60">{game.emoji}</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-900 border border-red-500/60 flex items-center justify-center">
                        <Lock size={10} className="text-red-300" />
                      </div>
                    </div>
                    <h3 className="relative text-sm font-medium text-red-300 mb-0.5">{game.name}</h3>
                    <p className="relative text-[10px] text-red-400/70 text-center">
                      推荐修为 {(game.minLevel || 0).toLocaleString()}
                    </p>
                    <p className="relative text-[9px] text-red-500/60 mt-0.5">⚠ 强闯极易陨落</p>
                  </button>
                );
              }

              // 正常卡片：渐变背景 + emoji 大图 + 主题色
              return (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(game)}
                  className={`group relative flex flex-col items-center p-4 rounded-2xl border bg-gradient-to-b ${t.bg} ${t.border} ${t.glow} hover:scale-[1.02] active:scale-95 transition-all overflow-hidden`}
                >
                  {/* 顶部最高分徽章 */}
                  {myHigh > 0 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[9px] text-amber-300 font-bold flex items-center z-10">
                      <Trophy size={8} className="mr-0.5" />{myHigh}
                    </div>
                  )}
                  {/* 装饰光晕 */}
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${t.accent} blur-2xl opacity-60 pointer-events-none`} />
                  {/* 主图标：emoji 大圆 */}
                  <div className={`relative w-14 h-14 rounded-2xl ${t.accent} border ${t.border} mb-2 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{game.emoji}</span>
                  </div>
                  <h3 className={`relative text-sm font-medium ${t.text} mb-0.5 tracking-wide`} style={{ fontFamily: '"Noto Serif SC", serif' }}>
                    {game.name}
                  </h3>
                  <p className="relative text-[10px] text-slate-400 text-center line-clamp-2">
                    {game.desc}
                  </p>
                </button>
              );
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encounter Modal · 卷轴风 */}
      <AnimatePresence>
        {encounter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            style={{ fontFamily: '"Noto Serif SC", serif' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative bg-gradient-to-b from-amber-950/90 to-slate-950 border border-amber-700/50 rounded-2xl p-6 max-w-sm w-full overflow-hidden shadow-[0_0_60px_rgba(251,191,36,0.15)]"
            >
              {/* 卷轴顶部金线 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
              {/* 装饰光晕 */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <div className="relative text-center mb-5">
                <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚠</span>
                </div>
                <h2 className="text-xl text-amber-300 tracking-[0.25em] mb-1" style={{ fontWeight: 600 }}>秘境拦路</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  通往【{encounter.game.name}】的路上，你被一队高阶修士拦下。<br/>
                  对方修为约为你的 <span className="text-amber-300 font-bold">{encounter.gap.toFixed(1)}</span> 倍。
                </p>
              </div>

              {encounterLog ? (
                <p className="relative text-sm text-emerald-300 text-center py-6">{encounterLog}</p>
              ) : (
                <div className="relative space-y-2.5">
                  <button
                    onClick={() => resolveEncounter('fight')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-rose-900/60 to-rose-800/40 hover:from-rose-800/70 hover:to-rose-700/50 border border-rose-600/50 text-rose-100 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center"
                  >
                    <span className="text-xl mr-3">⚔</span>
                    <span className="text-left">
                      <div className="font-bold tracking-wider">硬闯</div>
                      <div className="text-[10px] text-rose-300/70 mt-0.5">装备越好越易成功，失败折损 40% 灵石</div>
                    </span>
                  </button>
                  <button
                    onClick={() => resolveEncounter('stealth')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-900/50 to-indigo-800/30 hover:from-indigo-800/60 hover:to-indigo-700/40 border border-indigo-600/50 text-indigo-100 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center"
                  >
                    <span className="text-xl mr-3">🌙</span>
                    <span className="text-left">
                      <div className="font-bold tracking-wider">隐匿</div>
                      <div className="text-[10px] text-indigo-300/70 mt-0.5">灵根越好越易成功，失败仅折损 10%</div>
                    </span>
                  </button>
                  <button
                    onClick={() => resolveEncounter('detour')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-slate-800/60 to-slate-800/30 hover:from-slate-700/60 hover:to-slate-700/30 border border-slate-600/50 text-slate-200 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center"
                  >
                    <span className="text-xl mr-3">🚶</span>
                    <span className="text-left">
                      <div className="font-bold tracking-wider">绕路</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">安全离开，无损但也无获</div>
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Death Modal · 血色卷轴 */}
      <AnimatePresence>
        {deathModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            style={{ fontFamily: '"Noto Serif SC", serif' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-gradient-to-b from-red-950/95 to-slate-950 border border-red-700/50 rounded-2xl p-6 max-w-sm w-full text-center overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.18)]"
            >
              {/* 血色封印纹理 */}
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                   style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(239,68,68,0.2) 12px 13px)' }} />
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />

              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-red-500/15 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full bg-red-950/80 border-2 border-red-500/60 rounded-full flex items-center justify-center">
                  <Swords size={36} className="text-red-400" />
                </div>
              </div>
              <h2 className="relative text-2xl text-red-300 tracking-[0.3em] mb-3" style={{ fontWeight: 700 }}>杀人夺宝</h2>
              <p className="relative text-slate-300 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                道友境界低微，竟敢闯入高阶秘境！<br/>
                你遭遇高阶修士，被夺去 <span className="text-red-300 font-bold text-base">{lostStones.toLocaleString()}</span> 灵石。<br/>
                <span className="text-slate-500 text-xs">万幸保住性命与修为。</span>
              </p>
              <button
                onClick={() => setDeathModal(false)}
                className="relative w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-xl font-medium tracking-widest transition-all active:scale-[0.98]"
              >
                重新修炼
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Toast */}
      <AnimatePresence>
        {rewardToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-cyan-300 px-6 py-3 rounded-2xl shadow-xl border border-cyan-500/20 z-50 text-sm font-medium text-center flex items-center whitespace-nowrap"
          >
            历练结束，获得 <Gem size={16} className="mx-1" /> {rewardToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 魔渊副本 Host */}
      <Suspense fallback={null}>
        {demonAbyssOpen && (
          <DemonAbyssHost open={demonAbyssOpen} onClose={() => setDemonAbyssOpen(false)} />
        )}
      </Suspense>

      {/* New Record Toast */}
      <AnimatePresence>
        {newRecord !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/20 backdrop-blur-md text-amber-200 px-4 py-2 rounded-full shadow-xl border border-amber-400/40 z-50 text-xs font-bold flex items-center whitespace-nowrap"
          >
            <Trophy size={14} className="mr-1.5" /> 创下个人新纪录！
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
