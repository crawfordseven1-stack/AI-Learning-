
import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../constants';

interface LearningStyleQuizProps {
  onComplete: (answers: string[]) => void;
  onBack: () => void;
}

const LearningStyleQuiz: React.FC<LearningStyleQuizProps> = ({ onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;
  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl bg-surface p-8 rounded-xl shadow-lg animate-fade-in">
      <div className="relative">
        <button onClick={onBack} className="absolute -top-4 -left-4 text-text-secondary hover:text-text-primary">&larr; Back</button>
      </div>
      <h2 className="text-2xl font-bold text-center text-text-primary mb-4">Discover Your Learning Style</h2>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
      </div>
      
      <div className="text-center">
        <p className="text-lg text-text-secondary mb-2">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</p>
        <h3 className="text-xl font-semibold text-text-primary mb-6">{currentQuestion.question}</h3>
      </div>
      
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-primary hover:text-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LearningStyleQuiz;
