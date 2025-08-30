
import { LearningStyle } from './types';

export const LEARNING_STYLES = [
  {
    name: LearningStyle.VISUAL,
    description: "I learn best with mind maps, diagrams, and visual aids.",
    icon: "Eye",
  },
  {
    name: LearningStyle.FEYNMAN,
    description: "I prefer breaking down complex topics into simple explanations.",
    icon: "MessageSquare",
  },
  {
    name: LearningStyle.CORNELL_NOTES,
    description: "I like to organize information with structured notes.",
    icon: "FileText",
  },
  {
    name: LearningStyle.SQ3R,
    description: "I use a system: Survey, Question, Read, Recite, Review.",
    icon: "RefreshCw",
  },
];

export const QUIZ_QUESTIONS = [
    {
        question: "When faced with a new, complex topic, what is your first instinct?",
        options: [
            "To find a video or diagram that explains it.",
            "To try and explain it to someone else in simple terms.",
            "To start taking structured notes with questions in the margins.",
            "To skim through the material to get a general overview first."
        ]
    },
    {
        question: "How do you prefer to study for a test?",
        options: [
            "Drawing charts and creating color-coded notes.",
            "Talking through the concepts out loud as if teaching a class.",
            "Reviewing my organized notes and summarizing the summaries.",
            "Answering pre-made questions and reviewing sections I get wrong."
        ]
    },
    {
        question: "What's most helpful when you get 'stuck' on an idea?",
        options: [
            "Seeing a real-world example or a visual metaphor.",
            "Finding a very simple analogy to relate it to something I know.",
            "Writing down specific questions I have about it.",
            "Going back to the beginning and re-reading the material methodically."
        ]
    },
    {
        question: "When you assemble furniture, what is your approach?",
        options: [
            "I rely heavily on the diagrams and pictures in the manual.",
            "I read the steps and then try to explain them to myself before I do them.",
            "I lay out all the pieces and make notes on the instructions.",
            "I quickly scan all the instructions first to understand the whole process."
        ]
    }
];
