
import React, { useState } from 'react';
import { SessionData, LearningStyle, QuizQuestion, ChatMessage, CornellNotes, ActiveTab } from '../types';
import Icon from './Icon';
import ChatUI from './ChatUI';
import LoadingSpinner from './LoadingSpinner';

interface LearningSessionProps {
  sessionData: SessionData;
  learningStyle: LearningStyle;
  onStartOver: () => void;
  // State and handlers lifted up to App.tsx
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  notes: CornellNotes | null;
  quiz: QuizQuestion[] | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isLoading: boolean;
}

const LearningSession: React.FC<LearningSessionProps> = ({ 
    sessionData, 
    learningStyle,
    onStartOver,
    chatMessages,
    setChatMessages,
    notes,
    quiz,
    activeTab,
    onTabChange,
    isLoading,
}) => {

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Sidebar */}
      <aside className="lg:col-span-1 bg-surface p-6 rounded-xl shadow-lg h-fit lg:sticky top-24">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-text-primary">Learning Outline</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-primary mb-2">Summary</h3>
            <p className="text-text-secondary text-sm">{sessionData.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-2">Key Topics</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
              {sessionData.outline.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-2">Starting Questions</h3>
            <ul className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
              {sessionData.keyQuestions.map((q, index) => <li key={index}>{q}</li>)}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-lg min-h-[70vh] flex flex-col">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <TabButton name="Chat" icon="MessageSquare" active={activeTab === 'chat'} onClick={() => onTabChange('chat')} />
            <TabButton name="Notes" icon="FileText" active={activeTab === 'notes'} onClick={() => onTabChange('notes')} />
            <TabButton name="Quiz" icon="Clipboard" active={activeTab === 'quiz'} onClick={() => onTabChange('quiz')} />
          </nav>
        </div>

        <div className="flex-grow">
          {activeTab === 'chat' && <ChatUI sessionData={sessionData} learningStyle={learningStyle} messages={chatMessages} setMessages={setChatMessages}/>}
          {activeTab === 'notes' && (isLoading ? <LoadingSpinner message="Generating your notes..."/> : <NotesView notes={notes} />)}
          {activeTab === 'quiz' && (isLoading ? <LoadingSpinner message="Building your quiz..." /> : <QuizView quiz={quiz} />)}
        </div>
      </main>
    </div>
  );
};

const TabButton: React.FC<{name: string, icon: string, active: boolean, onClick: () => void}> = ({name, icon, active, onClick}) => (
    <button onClick={onClick} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 focus:outline-none ${active ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-gray-700 hover:border-gray-300'}`}>
        <Icon name={icon} className="h-5 w-5"/>
        <span>{name}</span>
    </button>
);

const NotesView: React.FC<{notes: CornellNotes | null}> = ({notes}) => {
    if (!notes) return <p className="text-center text-text-secondary mt-8">Generate your notes to get started!</p>;
    
    return (
        <div className="p-4 animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-center">Cornell Notes</h3>
            <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                <div className="col-span-2 border-r pr-4">
                    <h4 className="font-semibold text-primary mb-2">Main Notes</h4>
                    <p className="whitespace-pre-wrap text-sm text-text-secondary">{notes.mainNotes}</p>
                </div>
                <div className="col-span-1">
                    <h4 className="font-semibold text-primary mb-2">Cues & Questions</h4>
                    <p className="whitespace-pre-wrap text-sm text-text-secondary">{notes.cues}</p>
                </div>
                <div className="col-span-3 border-t pt-4 mt-4">
                    <h4 className="font-semibold text-primary mb-2">Summary</h4>
                    <p className="text-sm font-medium text-text-primary">{notes.summary}</p>
                </div>
            </div>
        </div>
    );
};

const QuizView: React.FC<{quiz: QuizQuestion[] | null}> = ({quiz}) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    if (!quiz) return <p className="text-center text-text-secondary mt-8">Your quiz is ready to be generated!</p>;

    const handleSelect = (qIndex: number, option: string) => {
        if(showResults) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const getResultColor = (qIndex: number, option: string) => {
        if (!showResults) return '';
        const question = quiz[qIndex];
        if (option === question.correctAnswer) return 'bg-green-100 border-green-500';
        if (selectedAnswers[qIndex] === option) return 'bg-red-100 border-red-500';
        return 'border-gray-300';
    }
    
    let score = 0;
    if(showResults) {
        quiz.forEach((q, i) => {
            if(selectedAnswers[i] === q.correctAnswer) {
                score++;
            }
        });
    }

    return (
        <div className="space-y-6 p-2 animate-fade-in">
            {quiz.map((q, qIndex) => (
                <div key={qIndex}>
                    <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                            <button
                                key={oIndex}
                                onClick={() => handleSelect(qIndex, option)}
                                className={`w-full text-left p-3 border rounded-lg transition-colors ${selectedAnswers[qIndex] === option && !showResults ? 'bg-indigo-100 border-primary' : ''} ${getResultColor(qIndex, option)}`}
                                disabled={showResults}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {showResults && (
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm">
                            <p className="font-bold">Explanation:</p>
                            <p className="text-text-secondary">{q.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
            {!showResults ? (
                 <button onClick={() => setShowResults(true)} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">
                    Submit Answers
                </button>
            ) : (
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <h3 className="text-xl font-bold">You scored {score} out of {quiz.length}!</h3>
                    <p className="text-text-secondary">Review the explanations above to reinforce your learning.</p>
                </div>
            )}
        </div>
    );
};

export default LearningSession;