import React, { useState } from "react";

const TriviaGame = () => {
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("setup"); // setup | loading | playing | finished
  const [answers, setAnswers] = useState([]);

  const toggleCategory = (category) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleAnswer = (index) => {
    const correct = questions[currentQuestion].correctAnswer === index;
    setAnswers([...answers, { question: currentQuestion, selected: index, correct }]);
    if (correct) setScore(score + 1);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameState("finished");
    }
  };

  const resetGame = () => {
    setCategories([]);
    setDifficulty("easy");
    setNumQuestions(5);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setGameState("setup");
    setAnswers([]);
  };

  const generateQuestions = async () => {
    if (categories.length === 0) {
      alert("Please select at least one category!");
      return;
    }

    setGameState("loading");

    try {
      const categoriesStr = categories.join(", ");
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
}`;

      // 🔥 DeepSeek API call
      const response = await fetch(
        `https://gtech-api-xtp1.onrender.com/api/deepseek/r1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "APIKEY" // replace with your real API key
          },
          body: JSON.stringify({ prompt })
        }
      );

      const data = await response.json();
      console.log("Raw API Response:", data);

      // ✅ Extract model response
      const textResponse = data?.text?.parts?.[0]?.text || "";

      // Try parsing as JSON directly
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(textResponse);
      } catch (e) {
        // fallback: extract JSON block if there's extra text
        const match = textResponse.match(/\{[\s\S]*\}/);
        if (match) {
          jsonResponse = JSON.parse(match[0]);
        } else {
          throw new Error("No valid JSON found in API response");
        }
      }

      if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
        setQuestions(jsonResponse.questions);
        setGameState("playing");
        setCurrentQuestion(0);
        setScore(0);
        setAnswers([]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
      setGameState("setup");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {gameState === "setup" && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Trivia Game</h1>

          <div>
            <p>Select Categories:</p>
            {["Science", "History", "Geography", "Sports", "Technology"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`m-1 px-3 py-1 rounded ${
                    categories.includes(cat)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div>
            <p>Difficulty:</p>
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`m-1 px-3 py-1 rounded ${
                  difficulty === d ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div>
            <p>Number of Questions:</p>
            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="border p-1 rounded w-20"
            />
          </div>

          <button
            onClick={generateQuestions}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === "loading" && <p>Loading questions...</p>}

      {gameState === "playing" && questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <p className="font-medium">{questions[currentQuestion].question}</p>
          <div className="space-y-2">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="block w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Game Over!</h2>
          <p>
            Your score: {score} / {questions.length}
          </p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TriviaGame;
