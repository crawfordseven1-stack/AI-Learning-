export enum AppState {
  WELCOME = 'WELCOME',
  LOADING = 'LOADING',
  LEARNING = 'LEARNING',
  SHOW_QUIZ = 'SHOW_QUIZ',
  SHOW_QUIZ_RESULTS = 'SHOW_QUIZ_RESULTS',
}

export enum LearningStyle {
  VISUAL = 'Visual',
  FEYNMAN = 'Feynman',
  CORNELL_NOTES = 'Cornell Notes',
  SQ3R = 'SQ3R Method',
}

export interface SessionData {
  summary: string;
  outline: string[];
  keyQuestions: string[];
  originalContent: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface CornellNotes {
    mainNotes: string;
    cues: string;
    summary: string;
}

export type ActiveTab = 'chat' | 'notes' | 'quiz';

export interface SavedSession {
  sessionData: SessionData;
  learningStyle: LearningStyle;
  chatMessages: ChatMessage[];
  quiz: QuizQuestion[] | null;
  notes: CornellNotes | null;
  activeTab: ActiveTab;
}