import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shuffle, Play, RotateCcw, Trophy, Clock, Target, Zap, Shield, Heart } from 'lucide-react';
import { MadeWithApplaa } from '@/components/made-with-applaa';

interface GameSession {
  id: string;
  type: 'puzzle' | 'story' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  objective: string;
  story?: string;
  puzzle?: {
    question: string;
    answer: string;
    hints: string[];
  };
  challenge?: {
    task: string;
    target: number;
    current: number;
  };
  timeLimit: number;
  timeRemaining: number;
  score: number;
  completed: boolean;
}

const storyTemplates = [
  {
    setting: "a mysterious abandoned space station",
    character: "lost astronaut",
    goal: "restore power before oxygen runs out",
    twist: "an unknown entity is watching your every move"
  },
  {
    setting: "an ancient underground temple",
    character: "brave explorer",
    goal: "decode the cryptic hieroglyphs",
    twist: "the temple rearranges itself every hour"
  },
  {
    setting: "a glitching digital world",
    character: "rogue AI",
    goal: "fix the corrupted code fragments",
    twist: "your own memories are being deleted"
  },
  {
    setting: "a time-traveling laboratory",
    character: "mad scientist",
    goal: "prevent a temporal paradox",
    twist: "your past actions are creating new timelines"
  }
];

const puzzleQuestions = [
  {
    question: "I speak without a mouth and hear without ears. What am I?",
    answer: "echo",
    hints: ["It's a phenomenon", "It repeats what you say", "You hear it in canyons"]
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    hints: ["It's related to movement", "You make them while walking", "They show where you've been"]
  },
  {
    question: "I have cities, but no houses. I have mountains, but no trees. What am I?",
    answer: "map",
    hints: ["It's used for navigation", "It shows geographical features", "It's flat but represents 3D world"]
  }
];

const challengeTasks = [
  {
    task: "Click the button exactly",
    target: 15,
    unit: "times"
  },
  {
    task: "Press Spacebar",
    target: 20,
    unit: "times"
  },
  {
    task: "Type the word 'dynamic'",
    target: 1,
    unit: "correctly"
  }
];

export default function DynamicGame4() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [spacebarCount, setSpacebarCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);

  const generateRandomSession = (): GameSession => {
    const types: GameSession['type'][] = ['puzzle', 'story', 'challenge'];
    const difficulties: GameSession['difficulty'][] = ['easy', 'medium', 'hard'];
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const baseTime = difficulty === 'easy' ? 120 : difficulty === 'medium' ? 90 : 60;
    const timeLimit = baseTime + Math.floor(Math.random() * 30);

    let session: GameSession = {
      id: Date.now().toString(),
      type,
      difficulty,
      objective: '',
      timeLimit,
      timeRemaining: timeLimit,
      score: 0,
      completed: false
    };

    switch (type) {
      case 'story':
        const story = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
        session.objective = `As a ${story.character} in ${story.setting}, ${story.goal}. But beware: ${story.twist}.`;
        session.story = session.objective;
        break;
      
      case 'puzzle':
        const puzzle = puzzleQuestions[Math.floor(Math.random() * puzzleQuestions.length)];
        session.objective = `Solve the riddle: ${puzzle.question}`;
        session.puzzle = puzzle;
        break;
      
      case 'challenge':
        const challenge = challengeTasks[Math.floor(Math.random() * challengeTasks.length)];
        session.objective = `${challenge.task} ${challenge.target} ${challenge.unit}`;
        session.challenge = {
          task: challenge.task,
          target: challenge.target,
          current: 0
        };
        break;
    }

    return session;
  };

  const startNewGame = () => {
    const newSession = generateRandomSession();
    setGameSession(newSession);
    setIsPlaying(true);
    setUserInput('');
    setSpacebarCount(0);
    setClickCount(0);
    toast.success('New game session started!');
  };

  const endGame = (completed: boolean) => {
    if (!gameSession) return;

    const finalScore = completed ? 
      gameSession.timeRemaining * 10 + (gameSession.difficulty === 'hard' ? 500 : gameSession.difficulty === 'medium' ? 300 : 200) :
      0;

    const updatedSession = {
      ...gameSession,
      completed,
      score: finalScore
    };

    setGameSession(updatedSession);
    setIsPlaying(false);
    setTotalScore(prev => prev + finalScore);
    setGameHistory(prev => [updatedSession, ...prev.slice(0, 4)]);

    if (completed) {
      toast.success(`Game completed! Score: ${finalScore}`);
    } else {
      toast.error('Game over! Time ran out');
    }
  };

  const handlePuzzleSubmit = () => {
    if (!gameSession?.puzzle) return;

    if (userInput.toLowerCase().trim() === gameSession.puzzle.answer.toLowerCase()) {
      endGame(true);
    } else {
      toast.error('Incorrect answer. Try again!');
    }
  };

  const handleChallengeClick = () => {
    if (!gameSession?.challenge) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (gameSession.challenge.task.includes('Click the button')) {
      if (newCount === gameSession.challenge.target) {
        endGame(true);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isPlaying || !gameSession?.challenge) return;

    if (e.code === 'Space' && gameSession.challenge.task.includes('Spacebar')) {
      e.preventDefault();
      const newCount = spacebarCount + 1;
      setSpacebarCount(newCount);
      if (newCount === gameSession.challenge.target) {
        endGame(true);
      }
    }
  };

  const handleTypingChallenge = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameSession?.challenge) return;

    const value = e.target.value;
    setUserInput(value);

    if (gameSession.challenge.task.includes('Type the word')) {
      if (value.toLowerCase() === 'dynamic') {
        endGame(true);
      }
    }
  };

  useEffect(() => {
    if (!isPlaying || !gameSession) return;

    const timer = setInterval(() => {
      setGameSession(prev => {
        if (!prev || prev.timeRemaining <= 1) {
          endGame(false);
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameSession]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameSession, spacebarCount]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Dynamic Game 4
          </h1>
          <p className="text-xl text-gray-300">Every session is a new adventure</p>
        </div>

        {!isPlaying && !gameSession && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Welcome to Dynamic Game 4</CardTitle>
              <CardDescription className="text-gray-300">
                Experience unique, replayable challenges that adapt to your gameplay
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={startNewGame} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Play className="mr-2 h-5 w-5" />
                Start New Game
              </Button>
              {totalScore > 0 && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="text-white text-lg">Total Score: <span className="font-bold text-yellow-400">{totalScore}</span></p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isPlaying && gameSession && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Shuffle className="h-6 w-6" />
                      {gameSession.type.charAt(0).toUpperCase() + gameSession.type.slice(1)} Mode
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={`${getDifficultyColor(gameSession.difficulty)} text-white`}>
                        {gameSession.difficulty.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(gameSession.timeRemaining)}
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={startNewGame} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                    <RotateCcw className="mr-1 h-4 w-4" />
                    New Game
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Objective
                    </h3>
                    <p className="text-gray-200 text-lg">{gameSession.objective}</p>
                  </div>

                  {gameSession.type === 'story' && (
                    <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <p className="text-purple-200 italic">"{gameSession.story}"</p>
                      <div className="mt-4 text-center">
                        <Button onClick={() => endGame(true)} className="bg-green-500 hover:bg-green-600">
                          <Trophy className="mr-2 h-4 w-4" />
                          Complete Story
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameSession.type === 'puzzle' && gameSession.puzzle && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <div className="flex gap-2 mb-4">
                          <Input
                            type="text"
                            placeholder="Your answer..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePuzzleSubmit()}
                            className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                          />
                          <Button onClick={handlePuzzleSubmit} className="bg-blue-500 hover:bg-blue-600">
                            Submit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-300">
                          <p>Hints available: {gameSession.puzzle.hints.length}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {gameSession.type === 'challenge' && gameSession.challenge && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                        {gameSession.challenge.task.includes('Click the button') && (
                          <div className="text-center space-y-4">
                            <Button 
                              onClick={handleChallengeClick} 
                              size="lg" 
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <Zap className="mr-2 h-5 w-5" />
                              Click Me! ({clickCount}/{gameSession.challenge?.target})
                            </Button>
                            <Progress value={(clickCount / gameSession.challenge.target) * 100} className="w-full" />
                          </div>
                        )}
                        
                        {gameSession.challenge.task.includes('Spacebar') && (
                          <div className="text-center space-y-4">
                            <div className="text-white text-lg">
                              Press the SPACEBAR ({spacebarCount}/{gameSession.challenge?.target})
                            </div>
                            <Progress value={(spacebarCount / gameSession.challenge.target) * 100} className="w-full" />
                          </div>
                        )}
                        
                        {gameSession.challenge.task.includes('Type the word') && (
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Type 'dynamic'..."
                              value={userInput}
                              onChange={handleTypingChallenge}
                              className="bg-white/10 border-white/30 text-white placeholder-gray-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Progress 
                    value={(gameSession.timeRemaining / gameSession.timeLimit) * 100} 
                    className="w-full bg-white/20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameHistory.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameHistory.map((game) => (
                  <div key={game.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getDifficultyColor(game.difficulty)} text-white text-xs`}>
                        {game.difficulty}
                      </Badge>
                      <span className="text-white capitalize">{game.type}</span>
                      <span className="text-gray-400 text-sm">
                        {game.completed ? '✓' : '✗'} {formatTime(game.timeLimit - game.timeRemaining)}
                      </span>
                    </div>
                    <span className="text-yellow-400 font-bold">{game.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <MadeWithApplaa />
    </div>
  );
}