import riddleData from './data.js';

const ChineseRiddleGame = () => {
    const [selectedLevels, setSelectedLevels] = React.useState({
        hsk1: true,
        hsk2: false,
        hsk3: false,
        hsk4: false,
        hsk5: false
    });
    const [gameStarted, setGameStarted] = React.useState(false);
    const [availableRiddles, setAvailableRiddles] = React.useState([]);
    const [currentRiddle, setCurrentRiddle] = React.useState(null);
    const [shownHints, setShownHints] = React.useState(1);
    const [userGuess, setUserGuess] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [showingSuccess, setShowingSuccess] = React.useState(false);

    // Function to get random riddle from selected levels
    const getRandomRiddle = () => {
        const riddles = [];
        Object.entries(selectedLevels).forEach(([level, isSelected]) => {
            if (isSelected && riddleData[level]) {
                riddles.push(...riddleData[level]);
            }
        });
        return riddles[Math.floor(Math.random() * riddles.length)];
    };

    const startGame = () => {
        const hasSelectedLevel = Object.values(selectedLevels).some(value => value);
        if (!hasSelectedLevel) {
            setMessage("Please select at least one HSK level");
            return;
        }
        setGameStarted(true);
        setCurrentRiddle(getRandomRiddle());
        setScore(0);
        setMessage("");
    };

    const handleLevelChange = (level) => {
        setSelectedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    const showNextHint = () => {
        if (shownHints < 3) {
            setShownHints(prev => prev + 1);
        }
    };

    const checkAnswer = () => {
        if (userGuess === currentRiddle.answer) {
            const pointsForHints = 4 - shownHints;
            setScore(prev => prev + pointsForHints);
            setMessage(`正確！ (Correct!) +${pointsForHints} points`);
            setIsCorrect(true);
        } else {
            setMessage("再試一次！ (Try again!)");
        }
    };

    const nextRiddle = () => {
        const newRiddle = getRandomRiddle();
        setCurrentRiddle(newRiddle);
        setShownHints(1);
        setUserGuess("");
        setMessage("");
        setIsCorrect(false);
        setShowingSuccess(false);
    };

    // Add a separate useEffect to handle setting showingSuccess
    React.useEffect(() => {
        if (isCorrect) {
            setShowingSuccess(true);
        }
    }, [isCorrect]);

    // Modify the keyboard handler
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                if (!isCorrect) {
                    checkAnswer();
                } else if (showingSuccess) {
                    nextRiddle();
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isCorrect, showingSuccess]);

    return (
        <div className="text-gray-200">
            {!gameStarted ? (
                <div className="space-y-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Select HSK Level(s):</h2>
                        <div className="flex gap-3 flex-wrap">
                            {Object.keys(selectedLevels).map(level => (
                                <button
                                    key={level}
                                    onClick={() => handleLevelChange(level)}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                        selectedLevels[level]
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    HSK {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={startGame}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all duration-200 font-semibold"
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl">Score: <span className="text-red-400 font-bold">{score}</span></span>
                        <button
                            onClick={startGame}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200"
                        >
                            New Game
                        </button>
                    </div>

                    <div className="bg-gray-700 rounded-xl p-6 space-y-4">
                        {[...Array(shownHints)].map((_, index) => (
                            <div key={index} className="text-lg">
                                <span className="text-red-400 font-semibold">Hint {index + 1}:</span> {currentRiddle.hints[index]}
                            </div>
                        ))}
                        
                        {shownHints < 3 ? (
                            <button
                                onClick={showNextHint}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-200 text-sm"
                            >
                                Show Next Hint
                            </button>
                        ) : !isCorrect && (
                            <button
                                onClick={() => setMessage(
                                    <div className="space-y-2">
                                        <div className="text-xl font-bold">{currentRiddle.answer}</div>
                                        <div className="text-lg">{currentRiddle.pinyin}</div>
                                        <div className="text-gray-300">{currentRiddle.english}</div>
                                    </div>
                                )}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-200 text-sm"
                            >
                                Show Answer
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            value={userGuess}
                            onChange={(e) => setUserGuess(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    checkAnswer();
                                }
                            }}
                            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Your answer..."
                        />
                        <button
                            onClick={checkAnswer}
                            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg transition-all duration-200"
                        >
                            Check Answer
                        </button>
                    </div>

                    {message && (
                        <div className={`text-center p-3 rounded-lg ${
                            isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                            <div className="mb-4">{message}</div>
                            {isCorrect && (
                                <button
                                    onClick={nextRiddle}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200"
                                >
                                    Next Word
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Render the game
const root = ReactDOM.createRoot(document.getElementById('game-root'));
root.render(<ChineseRiddleGame />);