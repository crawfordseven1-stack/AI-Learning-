
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, LearningStyle, SessionData, QuizQuestion, ChatMessage, CornellNotes, ActiveTab, SavedSession } from './types';
import { analyzeContent, getLearningStyleFromQuiz, generateQuiz, generateCornellNotes } from './services/geminiService';
import Header from './components/Header';
import ContentInput from './components/ContentInput';
import LearningStyleQuiz from './components/LearningStyleQuiz';
import LearningSession from './components/LearningSession';
import LoadingSpinner from './components/LoadingSpinner';
import QuizResults from './components/QuizResults';

const SAVED_SESSION_KEY = 'aiLearningCompanionSession';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for the learning session, lifted up from LearningSession component
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [notes, setNotes] = useState<CornellNotes | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isLoading, setIsLoading] = useState(false); // For quiz/notes generation
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Check for saved session on initial app load
  useEffect(() => {
    try {
      if (localStorage.getItem(SAVED_SESSION_KEY)) {
        setHasSavedSession(true);
      }
    } catch (error) {
      console.error("Could not read from localStorage:", error);
      localStorage.removeItem(SAVED_SESSION_KEY);
    }
  }, []);

  // Save session state to localStorage whenever it changes while learning
  useEffect(() => {
    if (appState === AppState.LEARNING && sessionData && learningStyle) {
      const sessionToSave: SavedSession = {
        sessionData,
        learningStyle,
        chatMessages,
        quiz,
        notes,
        activeTab,
      };
      try {
        localStorage.setItem(SAVED_SESSION_KEY, JSON.stringify(sessionToSave));
      } catch (error) {
        console.error("Could not save session to localStorage:", error);
      }
    }
  }, [appState, sessionData, learningStyle, chatMessages, quiz, notes, activeTab]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!sessionData || !learningStyle) return;
    setIsLoading(true);
    try {
      const generatedQuiz = await generateQuiz(sessionData.originalContent, learningStyle);
      setQuiz(generatedQuiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setErrorMessage("Sorry, I couldn't generate the quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionData, learningStyle]);

  const handleGenerateNotes = useCallback(async () => {
    if (!sessionData || !learningStyle) return;

    if (learningStyle !== LearningStyle.CORNELL_NOTES) {
      setNotes({ mainNotes: "Notes feature is optimized for Cornell Notes style. Try it out!", cues: "", summary: "" });
      return;
    }

    setIsLoading(true);
    try {
      const generatedNotes = await generateCornellNotes(sessionData.originalContent, chatMessages);
      setNotes(generatedNotes);
    } catch (error) {
      console.error("Error generating notes:", error);
      setErrorMessage("Sorry, I couldn't generate the notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionData, learningStyle, chatMessages]);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'quiz' && !quiz) {
      handleGenerateQuiz();
    }
    if (tab === 'notes' && !notes) {
      handleGenerateNotes();
    }
  }, [quiz, notes, handleGenerateQuiz, handleGenerateNotes]);

  const handleContentSubmit = useCallback(async (content: string, style: LearningStyle) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    localStorage.removeItem(SAVED_SESSION_KEY);
    setHasSavedSession(false);

    // Reset session state for a new session
    setChatMessages([]);
    setQuiz(null);
    setNotes(null);
    setActiveTab('chat');

    try {
      const data = await analyzeContent(content, style);
      setSessionData({ ...data, originalContent: content });
      setLearningStyle(style);
      setChatMessages([{ sender: 'ai', text: `Hello! I've reviewed your material. Here's a quick summary and some questions to get us started. Feel free to ask me anything!` }]);
      setAppState(AppState.LEARNING);
    } catch (error) {
      console.error("Error analyzing content:", error);
      setErrorMessage("Sorry, I couldn't process that content. Please try again.");
      setAppState(AppState.WELCOME);
    }
  }, []);

  const handleQuizComplete = useCallback(async (answers: string[]) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    try {
      const determinedStyle = await getLearningStyleFromQuiz(answers);
      setLearningStyle(determinedStyle);
      setAppState(AppState.SHOW_QUIZ_RESULTS);
    } catch (error) {
      console.error("Error determining learning style:", error);
      setErrorMessage("Sorry, there was an error analyzing your quiz results. Please try again.");
      setAppState(AppState.SHOW_QUIZ);
    }
  }, []);
  
  const handleStartOver = () => {
    localStorage.removeItem(SAVED_SESSION_KEY);
    setHasSavedSession(false);
    setAppState(AppState.WELCOME);
    setSessionData(null);
    setErrorMessage(null);
    setChatMessages([]);
    setQuiz(null);
    setNotes(null);
    setActiveTab('chat');
    setLearningStyle(null);
  };

  const handleResumeSession = () => {
    try {
      const savedSessionJSON = localStorage.getItem(SAVED_SESSION_KEY);
      if (savedSessionJSON) {
        const saved: SavedSession = JSON.parse(savedSessionJSON);
        setSessionData(saved.sessionData);
        setLearningStyle(saved.learningStyle);
        setChatMessages(saved.chatMessages);
        setQuiz(saved.quiz);
        setNotes(saved.notes);
        setActiveTab(saved.activeTab);
        setAppState(AppState.LEARNING);
        setHasSavedSession(false); // Hide the resume button after resuming
      } else {
        setErrorMessage("Could not find a saved session to resume.");
        setHasSavedSession(false);
      }
    } catch (error) {
      console.error("Failed to parse or load saved session:", error);
      setErrorMessage("Your saved session might be corrupted. Starting fresh.");
      handleStartOver();
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <LoadingSpinner message="Your learning companion is preparing your session..." />;
      case AppState.SHOW_QUIZ:
        return <LearningStyleQuiz onComplete={handleQuizComplete} onBack={() => setAppState(AppState.WELCOME)} />;
      case AppState.SHOW_QUIZ_RESULTS:
        if (learningStyle) {
            return <QuizResults learningStyle={learningStyle} onContinue={() => setAppState(AppState.WELCOME)} />;
        }
        // Fallback if style is not set
        handleStartOver();
        return null;
      case AppState.LEARNING:
        if (sessionData && learningStyle) {
          return (
            <LearningSession 
              sessionData={sessionData} 
              learningStyle={learningStyle} 
              onStartOver={handleStartOver}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              notes={notes}
              quiz={quiz}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isLoading={isLoading}
            />
          );
        }
        // Fallback if state is inconsistent
        handleStartOver();
        return null;
      case AppState.WELCOME:
      default:
        return (
          <ContentInput 
            onSubmit={handleContentSubmit} 
            selectedStyle={learningStyle}
            onSelectStyle={setLearningStyle}
            onTakeQuiz={() => setAppState(AppState.SHOW_QUIZ)}
            hasSavedSession={hasSavedSession}
            onResumeSession={handleResumeSession}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onStartOver={appState === AppState.LEARNING ? handleStartOver : undefined}/>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        {errorMessage && (
          <div className="w-full max-w-3xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Oh no! </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-text-secondary">
        <p>Built with Gemini & React. Designed for all learners.</p>
      </footer>
    </div>
  );
};

export default App;