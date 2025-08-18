import React, { useState } from 'react';

const TriviaGame = () => {
  const [gameState, setGameState] = useState('setup'); // setup, loading, playing, results
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const availableCategories = [
    'Science', 'History', 'Geography', 'Sports', 'Movies', 'Music', 
    'Literature', 'Art', 'Technology', 'Food', 'Animals', 'Space'
  ];

  const toggleCategory = (category) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateQuestions = async () => {
    if (categories.length === 0) {
      alert('Please select at least one category!');
      return;
    }

    setGameState('loading');

    try {
      const categoriesStr = categories.join(', ');

      const prompt = `Generate exactly ${numQuestions} trivia questions.
Each question must be:
- Multiple choice with exactly 4 options
- Have one correct answer
- Include the category and difficulty level
- Categories: ${categoriesStr}
- Difficulty: ${difficulty}

Respond ONLY with a JSON object like this:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "category": "Category Name"
    }
  ]
}`;

      const apiUrl = `https://gtech-api-xtp1.onrender.com/api/deepseek/r1?prompt=${encodeURIComponent(prompt)}&apikey=APIKEY`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status && data.text && data.text.parts && data.text.parts[0]?.text) {
        const jsonResponse = JSON.parse(data.text.parts[0].text);

        if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
          setQuestions(jsonResponse.questions);
          setGameState('playing');
          setCurrentQuestion(0);
          setScore(0);
          setAnswers([]);
          setSelectedAnswer(null);
          setShowAnswer(false);
        } else {
          throw new Error('Invalid response format from API');
        }
      } else {
        throw new Error('API returned an error or unexpected format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
      setGameState('setup');
    }
  };

  const selectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer!');
      return;
    }

    if (!showAnswer) {
      setShowAnswer(true);
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect
    }];

    setAnswers(newAnswers);

    if (isCorrect) setScore(score + 1);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setQuestions([]);
    setShowAnswer(false);
  };

  // --- RENDERING ---

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mt-8 mb-8">
            <h1 className="text-6xl font-black mb-4 text-green-400">Trivia</h1>
            <p className="text-xl text-gray-300">Test your knowledge with API-generated trivia questions</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-700">
            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-green-400">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`p-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                      categories.includes(category)
                        ? 'bg-green-500 text-black border-green-400 shadow-lg'
                        : 'bg-gray-700 text-white border-gray-600 hover:border-green-400 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-green-400">Difficulty</h2>
              <div className="flex gap-3">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 capitalize ${
                      difficulty === diff
                        ? 'bg-green-500 text-black border-green-400 shadow-lg'
                        : 'bg-gray-700 text-white border-gray-600 hover:border-green-400 hover:bg-gray-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-green-400">Number of questions</h2>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                      numQuestions === num
                        ? 'bg-green-500 text-black border-green-400 shadow-lg'
                        : 'bg-gray-700 text-white border-gray-600 hover:border-green-400 hover:bg-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              Start game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-green-400">Generating questions...</h2>
          <p className="text-gray-300">Preparing your trivia challenge</p>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-green-400 font-bold text-lg">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="text-green-400 font-bold text-lg">
              Score: {score}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-700">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-green-500 text-black rounded-full text-sm font-semibold mb-4">
                {question.category}
              </span>
              <h2 className="text-2xl font-bold leading-relaxed">{question.question}</h2>
            </div>

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => {
                let buttonClass = 'w-full p-4 rounded-xl font-semibold text-left transition-all duration-200 border-2 ';
                let showCheckmark = false;

                if (showAnswer) {
                  if (index === question.correctAnswer) {
                    buttonClass += 'bg-green-500 text-black border-green-400 shadow-lg';
                    showCheckmark = selectedAnswer === question.correctAnswer;
                  } else if (index === selectedAnswer && index !== question.correctAnswer) {
                    buttonClass += 'bg-red-500 text-white border-red-400 shadow-lg';
                  } else {
                    buttonClass += 'bg-gray-600 text-gray-300 border-gray-500';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += 'bg-green-500 text-black border-green-400 shadow-lg';
                  } else {
                    buttonClass += 'bg-gray-700 text-white border-gray-600 hover:border-green-400 hover:bg-gray-600';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && selectAnswer(index)}
                    disabled={showAnswer}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </div>
                      <div className="text-xl">
                        {showCheckmark && '✔️'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextQuestion}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              {currentQuestion + 1 === questions.length && showAnswer ? 'See results' : showAnswer ? 'Next question' : 'Check answer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <h2 className="text-6xl font-black text-green-400 mb-4">Game Over</h2>
        <p className="text-xl text-gray-300 mb-8">
          Your score: {score} / {questions.length}
        </p>
        <button
          onClick={resetGame}
          className="bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
        >
          Play again
        </button>
      </div>
    );
  }

  return null;
};

export default TriviaGame;
