import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gamepad2, Swords, Shield, Scroll, Sparkles, Gem, X, Flame, Lock, CloudSun, Compass } from 'lucide-react';
import { useStore, SPIRITUAL_ROOTS } from '../store';

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
            setGameOver(true);
            onGameOver(score);
            return prev;
          }
        }

        if (prev.some(segment => segment.x === nx && segment.y === ny)) {
          setGameOver(true);
          onGameOver(score);
          return prev;
        }

        const newSnake = [{x: nx, y: ny}, ...prev];
        if (nx === food.x && ny === food.y) {
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
      setGameState('fail');
      onGameOver(score);
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
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
const BloodForbiddenGame = ({ onGameOver }: { onGameOver: (score: number) => void }) => {
  const { levelIndex, addMaterial } = useStore();
  const [steps, setSteps] = useState(10);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<string[]>(['你进入了血色禁地，四周弥漫着诡异的红雾。']);
  const [gameOver, setGameOver] = useState(false);
  const [health, setHealth] = useState(100 + levelIndex * 20);
  const maxHealth = 100 + levelIndex * 20;

  const addLogMsg = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const explore = (direction: string) => {
    if (gameOver) return;

    const rand = Math.random();
    let newScore = score;
    let newHealth = health;

    if (rand < 0.3) {
      // Find herbs
      const herbsFound = Math.floor(Math.random() * 3) + 1;
      addLogMsg(`你向${direction}探索，发现了一株珍稀灵草！`);
      addMaterial('rare_herb', herbsFound);
      newScore += herbsFound * 500;
    } else if (rand < 0.6) {
      // Find spirit stones
      const stonesFound = Math.floor(Math.random() * 500) + 100;
      addLogMsg(`你向${direction}探索，在一个隐蔽的洞穴中找到了 ${stonesFound} 灵石。`);
      newScore += stonesFound;
    } else if (rand < 0.8) {
      // Encounter monster
      const dmg = Math.floor(Math.random() * 30) + 10;
      newHealth -= dmg;
      addLogMsg(`你向${direction}探索，遭遇了妖兽袭击！损失了 ${dmg} 点气血。`);
    } else {
      // Encounter cultivator
      const dmg = Math.floor(Math.random() * 50) + 20;
      newHealth -= dmg;
      addLogMsg(`你向${direction}探索，遭遇了其他修仙者偷袭！损失了 ${dmg} 点气血。`);
    }

    setHealth(newHealth);
    setScore(newScore);
    setSteps(prev => prev - 1);

    if (newHealth <= 0) {
      addLogMsg('你重伤倒地，被迫传送出了血色禁地。');
      setGameOver(true);
      setTimeout(() => onGameOver(Math.floor(newScore * 0.5)), 2000); // Lose half score on death
    } else if (steps - 1 <= 0) {
      addLogMsg('禁地即将关闭，你被传送了出去。');
      setGameOver(true);
      setTimeout(() => onGameOver(newScore), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <h2 className="text-xl font-bold text-red-500 mb-4">血色禁地</h2>
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
        {gameOver ? (
          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">试炼结束</h3>
            <p className="text-amber-400 mb-4">获得总价值: {score} 灵石</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-emerald-400 font-bold">气血: {Math.floor(health)} / {maxHealth}</span>
              <span className="text-sky-400 font-bold">剩余步数: {steps}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button onClick={() => explore('左')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors">向左</button>
              <button onClick={() => explore('前')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors">向前</button>
              <button onClick={() => explore('右')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors">向右</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 h-40 overflow-y-auto text-left text-xs space-y-2 border border-slate-700">
              {log.map((msg, idx) => (
                <p key={idx} className={idx === 0 ? 'text-slate-200 font-bold' : 'text-slate-500'}>{msg}</p>
              ))}
            </div>
          </div>
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
    const bossDmg = Math.floor((Math.random() * 15 + 5 + kunwuStones * 2) * defBonus); // Boss gets stronger
    
    setBossHealth(prev => Math.max(0, prev - dmg));
    setHealth(prev => Math.max(0, prev - bossDmg));
    
    if (bossHealth - dmg <= 0) {
      setKunwuStones(prev => prev + 5);
      setBossHealth(500 + (kunwuStones + 5) * 50); // Next boss is stronger
      setHealth(prev => Math.min(baseHealth, prev + baseHealth * 0.2)); // Heal 20% on kill
    }
    
    if (health - bossDmg <= 0) {
      setGameOver(true);
      onGameOver(kunwuStones * 5000); // 1 Kunwu stone = 5000 spirit stones
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

const GAME_LIST = [
  { id: 'meditation', name: '闭关修炼', icon: <CloudSun size={24} className="text-sky-400" />, desc: '静心打坐，获取修为', minLevel: 0 },
  { id: '2048', name: '两仪微尘阵 (2048)', icon: <Sparkles size={24} className="text-emerald-400" />, desc: '推演阵法变化，获取灵石', minLevel: 0 },
  { id: 'snake', name: '灵蛇吐息 (贪吃蛇)', icon: <Swords size={24} className="text-rose-400" />, desc: '操控灵蛇吞噬灵气', minLevel: 2000 }, // 炼气期
  { id: 'alchemy', name: '炼丹模拟', icon: <Flame size={24} className="text-amber-500" />, desc: '控制火候，炼制仙丹', minLevel: 10000 }, // 筑基期
  { id: 'memory', name: '虚天殿寻宝', icon: <Shield size={24} className="text-indigo-400" />, desc: '记忆翻牌，寻找宝物', minLevel: 30000 }, // 金丹期
  { id: 'blood_forbidden', name: '血色禁地', icon: <Scroll size={24} className="text-red-500" />, desc: '危险区域，可能遭遇夺宝，可获得珍稀灵草', minLevel: 100000 }, // 元婴期
  { id: 'coming_3', name: '大衍决推演', icon: <Gamepad2 size={24} className="text-slate-500" />, desc: '敬请期待', locked: true, minLevel: 300000 }, // 化神期
  { id: 'coming_4', name: '灵兽山御兽', icon: <Zap size={24} className="text-slate-500" />, desc: '敬请期待', locked: true, minLevel: 600000 }, // 炼虚期
  { id: 'monster_hunt', name: '乱星海捕妖', icon: <Swords size={24} className="text-blue-400" />, desc: '出海捕杀妖兽，获取妖丹', minLevel: 1000000 }, // 合体期
  { id: 'devilfall', name: '坠魔谷探险', icon: <Shield size={24} className="text-purple-400" />, desc: '深入坠魔谷，寻找上古遗宝', minLevel: 2000000 }, // 大乘期
  { id: 'kunwu', name: '昆吾山斗法', icon: <Scroll size={24} className="text-amber-400" />, desc: '攀登昆吾山，开采昆吾石', minLevel: 5000000 }, // 渡劫期
];

export default function GamesPage() {
  const { activeGame, setActiveGame, updateQuestProgress, addSpiritStones, logs, bonusPoints, inventory, spiritualRoot, resetCultivation, createdAt, spiritStones, realmExplorationTotal } = useStore();
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [deathModal, setDeathModal] = useState<boolean>(false);
  const [lostStones, setLostStones] = useState<number>(0);

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
    if (game.locked) return;
    
    const isLevelLocked = game.minLevel !== undefined && totalAmount < game.minLevel;
    if (isLevelLocked) {
      const isProtected = Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000;
      
      if (isProtected) {
        // Protected, let them play or show a warning
        // For now, let them play
      } else {
        // 80% chance to be killed and robbed
        if (Math.random() < 0.8) {
          const lost = Math.floor((spiritStones || 0) * 0.5); // Lose 50% of spirit stones
          setLostStones(lost);
          addSpiritStones(-lost);
          setDeathModal(true);
          return;
        }
      }
    }
    
    setActiveGame(game.id);
  };

  return (
    <div className="p-6 max-w-md mx-auto pb-32 min-h-full flex flex-col">
      <h1 className="text-2xl font-light tracking-wider text-slate-100 mb-2 flex items-center">
        <Trophy className="mr-2 text-amber-400" /> 秘境历练
      </h1>
      
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {activeGame === '2048' && <Game2048 onGameOver={handleGameOver} />}
              {activeGame === 'snake' && <SnakeGame onGameOver={handleGameOver} />}
              {activeGame === 'alchemy' && <AlchemyGame onGameOver={handleGameOver} />}
              {activeGame === 'memory' && <MemoryGame onGameOver={handleGameOver} />}
              {activeGame === 'meditation' && <MeditationGame onGameOver={handleGameOver} />}
              {activeGame === 'monster_hunt' && <MonsterHuntGame onGameOver={handleGameOver} />}
              {activeGame === 'devilfall' && <DevilfallGame onGameOver={handleGameOver} />}
              {activeGame === 'kunwu' && <KunwuGame onGameOver={handleGameOver} />}
              {activeGame === 'blood_forbidden' && <BloodForbiddenGame onGameOver={handleGameOver} />}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-2 gap-4"
          >
            {GAME_LIST.map(game => {
              const isLevelLocked = game.minLevel !== undefined && totalAmount < game.minLevel;
              const isLocked = game.locked; // Only truly locked if it's a "coming soon" game

              return (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(game)}
                  disabled={isLocked}
                  className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                    isLocked 
                      ? 'bg-slate-800/30 border-slate-800 cursor-not-allowed opacity-60' 
                      : isLevelLocked
                        ? 'bg-red-900/20 border-red-900/50 hover:bg-red-900/40 hover:border-red-700 active:scale-95'
                        : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 active:scale-95'
                  }`}
                >
                  <div className="p-3 bg-slate-900 rounded-xl mb-3 relative">
                    {game.icon}
                    {isLevelLocked && !isLocked && (
                      <div className="absolute inset-0 bg-red-900/80 rounded-xl flex items-center justify-center">
                        <Lock size={16} className="text-red-400" />
                      </div>
                    )}
                  </div>
                  <h3 className={`text-sm font-medium mb-1 ${isLevelLocked && !isLocked ? 'text-red-300' : 'text-slate-200'}`}>{game.name}</h3>
                  <p className="text-[10px] text-slate-500 text-center line-clamp-2">
                    {isLevelLocked && !isLocked ? `极度危险！推荐修为: ${game.minLevel}` : game.desc}
                  </p>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Death Modal */}
      <AnimatePresence>
        {deathModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Swords size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">杀人夺宝！</h2>
              <p className="text-slate-300 text-sm mb-6">
                道友境界低微，竟敢闯入高阶秘境！你遭遇了高阶修士，被杀人夺宝，损失了 {lostStones} 灵石！万幸保住了性命和修为。
              </p>
              <button
                onClick={() => setDeathModal(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
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
    </div>
  );
}
