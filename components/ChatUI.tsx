import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { LearningStyle, ChatMessage, SessionData } from '../types';
import Icon from './Icon';

interface ChatUIProps {
    sessionData: SessionData;
    learningStyle: LearningStyle;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Icon name="Brain" className="w-5 h-5 text-white" />
                </div>
            )}
            <div className={`max-w-md lg:max-w-lg p-3 rounded-lg ${isUser ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};


const ChatUI: React.FC<ChatUIProps> = ({ sessionData, learningStyle, messages, setMessages }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startStream = useCallback(async (prompt: string) => {
        if (isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: prompt }];
        setMessages(newMessages);
        setUserInput(''); // Clear input regardless of source
        setIsLoading(true);
        
        setMessages(currentMessages => [...currentMessages, { sender: 'ai', text: '' }]);

        try {
            await streamChatResponse(
                sessionData.originalContent,
                newMessages,
                learningStyle,
                (chunk) => {
                    setMessages(currentMessages => {
                        const lastMessage = currentMessages[currentMessages.length - 1];
                        if (lastMessage && lastMessage.sender === 'ai') {
                            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
                            return [...currentMessages.slice(0, -1), updatedMessage];
                        }
                        return currentMessages;
                    });
                }
            );
        } catch (error) {
            console.error("Error streaming chat response:", error);
            const errorMessage = { sender: 'ai' as const, text: "I'm having a little trouble right now. Please try again in a moment." };
            setMessages(currentMessages => {
                 const lastMessage = currentMessages[currentMessages.length - 1];
                 // Replace the empty placeholder with an error
                 if(lastMessage && lastMessage.sender === 'ai' && lastMessage.text === '') {
                    return [...currentMessages.slice(0, -1), errorMessage];
                 }
                 return [...currentMessages, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, sessionData, learningStyle, setMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (trimmedInput) {
            startStream(trimmedInput);
        }
    };
    
    const handleExplainMore = () => {
        startStream('Can you elaborate on your last response?');
    };

    const lastMessage = messages[messages.length - 1];
    const showExplainMore = lastMessage && lastMessage.sender === 'ai' && lastMessage.text.trim() !== '' && !isLoading;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                {messages.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}

                {showExplainMore && (
                    <div className="flex justify-start pl-11 pt-2 animate-fade-in">
                        <button
                            onClick={handleExplainMore}
                            className="text-xs font-semibold text-primary py-1 px-3 rounded-full bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
                        >
                            Explain More
                        </button>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                    aria-label="Your message"
                />
                <button
                    type="submit"
                    className="p-3 bg-primary text-white rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    disabled={isLoading || !userInput.trim()}
                    aria-label="Send message"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-live="polite">
                            <span className="sr-only">Loading...</span>
                        </div>
                    ) : (
                        <Icon name="Send" className="w-6 h-6" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatUI;