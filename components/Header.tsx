
import React from 'react';
import Icon from './Icon';

interface HeaderProps {
    onStartOver?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartOver }) => {
  return (
    <header className="bg-surface shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
                <Icon name="Brain" className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">AI Learning Companion</h1>
          </div>
          {onStartOver && (
            <button
                onClick={onStartOver}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                <Icon name="Home" className="h-4 w-4 mr-2" />
                Start Over
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
