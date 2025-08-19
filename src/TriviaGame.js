import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const TriviaGame = () => {
  const [gameState, setGameState] = useState('setup'); // setup, loading, playing, checking, results
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
      const prompt = `Generate exactly ${numQuestions} trivia questions with the following specifications:
- Categories: ${categoriesStr}
- Difficulty: ${difficulty}
- Format: Multiple choice with 4 options

Respond ONLY with a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "What is the chemical symbol for gold?",
      "options": ["Au", "Ag", "Go", "Gd"],
      "correctAnswer": 0,
      "category": "Science"
    }
  ]
}

Make sure each question has exactly 4 plausible options and the correctAnswer is the index (0-3) of the correct option.
DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. Your entire response must be a single, valid JSON object.`;

      // Use GenAI SDK instead of REST API
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY not found in environment variables');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemma-3-27b-it",
        contents: prompt,
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7
        }
      });

      const responseText = response.text;
      
      // Clean up the response text in case it has markdown or extra formatting
      const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonResponse = JSON.parse(cleanedResponse);
      
      if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
        setQuestions(jsonResponse.questions);
        setGameState('playing');
        setCurrentQuestion(0);
        setScore(0);
        setAnswers([]);
      } else {
        throw new Error('Invalid response format - missing questions array');
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
      // First click - show the answer
      setShowAnswer(true);
      return;
    }

    // Second click - move to next question
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect
    }];
    
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
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

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mt-8 mb-8">
            <h1 className="text-6xl font-black mb-4 text-green-400">Trivia</h1>
            <p className="text-xl text-gray-300">Test your knowledge with Claude-generated trivia questions</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-700">
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
                      <div className="text-black text-xl w-6 h-6 flex items-center justify-center">
                        {showCheckmark && '✓'}
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
              {!showAnswer 
                ? 'Check answer' 
                : currentQuestion + 1 === questions.length 
                ? 'Finish game' 
                : 'Next question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-black mb-4 text-green-400">Results</h1>
          
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-700 mb-8">
            <div className="text-6xl font-black mb-4 text-green-400">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-bold mb-6">
              {percentage}% Correct
            </div>
            
            <div className="text-lg mb-8">
              {percentage >= 80 ? '🏆 Excellent!' : 
               percentage >= 60 ? '👍 Good job!' : 
               percentage >= 40 ? '👌 Not bad!' : '📚 Keep studying!'}
            </div>

            <div className="space-y-4 mb-8 text-left">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer && userAnswer.isCorrect;
                return (
                  <div key={index} className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'border-green-400 bg-green-900/30' : 'border-red-400 bg-red-900/30'
                  }`}>
                    <div className="font-semibold mb-2">{question.question}</div>
                    <div className="text-sm">
                      <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                        Your answer: {question.options[userAnswer.selectedAnswer]}
                      </span>
                      {!isCorrect && (
                        <div className="text-green-400">
                          Correct answer: {question.options[question.correctAnswer]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              Play again
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default TriviaGame;
