
import React, { useState } from 'react';
import { LearningStyle } from '../types';
import { LEARNING_STYLES } from '../constants';
import Icon from './Icon';

interface ContentInputProps {
  onSubmit: (content: string, style: LearningStyle) => void;
  selectedStyle: LearningStyle | null;
  onSelectStyle: (style: LearningStyle) => void;
  onTakeQuiz: () => void;
  hasSavedSession: boolean;
  onResumeSession: () => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ onSubmit, selectedStyle, onSelectStyle, onTakeQuiz, hasSavedSession, onResumeSession }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please paste some content to learn.');
      return;
    }
    if (!selectedStyle) {
      setError('Please select a learning style.');
      return;
    }
    setError('');
    onSubmit(content, selectedStyle);
  };

  return (
    <div className="w-full max-w-3xl animate-fade-in">
      <div className="bg-surface p-8 rounded-xl shadow-lg">
        {hasSavedSession && (
          <div className="mb-6 text-center">
            <button
              onClick={onResumeSession}
              className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-transform transform hover:scale-105"
            >
              Resume Previous Session
            </button>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-text-secondary text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-center text-text-primary mb-2">Start a New Learning Session</h2>
        <p className="text-center text-text-secondary mb-6">Paste your learning material below and choose how you'd like to learn.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-text-primary mb-2">
              Paste Your Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
              placeholder="Paste an article, transcript, or any text here..."
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Choose Your Learning Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARNING_STYLES.map((style) => (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => onSelectStyle(style.name)}
                  className={`p-4 border rounded-lg text-left transition-all duration-200 flex items-start space-x-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                    selectedStyle === style.name
                      ? 'bg-primary text-white border-primary-focus shadow-md'
                      : 'bg-background hover:bg-gray-200'
                  }`}
                >
                  <Icon name={style.icon} className={`h-6 w-6 mt-1 flex-shrink-0 ${selectedStyle === style.name ? 'text-white' : 'text-primary'}`} />
                  <div>
                    <span className="font-semibold">{style.name}</span>
                    <p className={`text-sm ${selectedStyle === style.name ? 'text-indigo-100' : 'text-text-secondary'}`}>{style.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-4">
                <p className="text-text-secondary">Not sure about your style?
                    <button type="button" onClick={onTakeQuiz} className="font-semibold text-primary hover:underline ml-1">
                        Take a quick quiz!
                    </button>
                </p>
            </div>
          </div>
          
          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContentInput;
