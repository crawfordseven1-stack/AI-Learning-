import React from 'react';
import { LearningStyle } from '../types';
import { LEARNING_STYLES } from '../constants';
import Icon from './Icon';

interface QuizResultsProps {
  learningStyle: LearningStyle;
  onContinue: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ learningStyle, onContinue }) => {
  const styleInfo = LEARNING_STYLES.find(style => style.name === learningStyle);

  if (!styleInfo) {
    return (
      <div className="w-full max-w-2xl bg-surface p-8 rounded-xl shadow-lg animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Quiz Results</h2>
        <p className="text-text-secondary mb-6">Could not determine learning style. Please try again.</p>
        <button
          onClick={onContinue}
          className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-surface p-8 rounded-xl shadow-lg animate-fade-in text-center">
      <div className="flex justify-center items-center mb-4">
          <div className="bg-primary p-3 rounded-full">
              <Icon name={styleInfo.icon} className="h-8 w-8 text-white" />
          </div>
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Your Learning Style is: {styleInfo.name}</h2>
      <p className="text-lg text-text-secondary mb-6">{styleInfo.description}</p>
      <p className="mb-6 text-text-primary">
        We'll now tailor your learning experience to this style. You can always select a different style when you start a new session.
      </p>
      <button
        onClick={onContinue}
        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
      >
        Continue
      </button>
    </div>
  );
};

export default QuizResults;
