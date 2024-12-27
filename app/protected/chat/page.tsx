'use client';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SendIcon, BotIcon, UserIcon, MenuIcon, XIcon, PlusIcon, FileText } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  last_message_date: Date;
}

interface ChatSessionData {
  session_id: string;
  title: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchChatSessions();
    newChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('session_id, title, timestamp')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const uniqueSessions = (data as ChatSessionData[]).reduce((acc: ChatSession[], curr) => {
        if (!acc.find(session => session.id === curr.session_id)) {
          acc.push({
            id: curr.session_id,
            title: curr.title,
            last_message_date: new Date(curr.timestamp)
          });
        }
        return acc;
      }, []);
      setChatSessions(uniqueSessions);
    } catch (error) {
      // console.error('Error fetching chat sessions:', error);
    }
  };

  const newChat = () => {
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: currentSessionId,
          title: chatSessions.find(session => session.id === currentSessionId)?.title || inputMessage.substring(0, 50) + '...',
        }),
      });

      const rawResponse = await response.text();
      let responseContent: string;

      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(rawResponse);
        responseContent = jsonData.message || jsonData.content || jsonData.response || rawResponse;
      } catch (jsonError) {
        // If not JSON, use the raw text
        responseContent = rawResponse;
      }

      if (!response.ok) {
        throw new Error(responseContent || `HTTP error! status: ${response.status}`);
      }

      const aiResponse: Message = {
        id: uuidv4(),
        content: responseContent,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      await fetchChatSessions();

    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        content: `Error: ${errorMessage}`,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data as any[]).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender as 'user' | 'ai',
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading chat session:', error);
    } finally {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-4 flex-grow">
              <Button
                onClick={newChat}
                className="w-full mb-4 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon size={16} />
                New Chat
              </Button>

              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className="mb-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                  onClick={() => loadChatSession(session.id)}
                >
                  <h3 className="font-medium text-gray-800 truncate">{session.title}</h3>
                  <p className="text-sm text-gray-500">
                    {session.last_message_date.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 space-y-2">
              <Link href="/protected/documents" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-gray-600 hover:text-gray-800"
                >
                  <FileText size={16} />
                  Documents
                </Button>
              </Link>
              <Link href="/" className="block w-full">
                <Button variant="outline" className="w-full">
                  Home
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-grow flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MenuIcon size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Marathon Running Coach AI</h1>
          <div className="w-6" />
        </header>

        <main className="flex-grow p-4 overflow-hidden bg-gray-50">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col p-4">
            <div className="flex-grow overflow-y-auto mb-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg shadow-sm ${message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'user' ? (
                        <UserIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <BotIcon className="w-4 h-4 mr-2" />
                      )}
                      <span
                        className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
                    <p className="text-gray-800">AI is typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className="flex-grow p-2 bg-transparent text-gray-800 focus:outline-none"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          © 2024 AI Agent Chat. All rights reserved.
        </footer>
      </div>
    </div>
  );
}