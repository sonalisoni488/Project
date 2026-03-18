import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Send, X, MessageCircle, User } from 'lucide-react';

const ChatComponent = ({ chatId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chats/${chatId}`);
      if (response.data.success) {
        setChat(response.data.data);
        setMessages(response.data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/chats/message', {
        chatId,
        text: newMessage.trim()
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async () => {
    try {
      await api.put(`/chats/${chatId}/close`);
      setChat(prev => ({ ...prev, status: 'closed' }));
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] max-h-[700px] flex flex-col m-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {chat?.listing?.title || 'Chat'}
              </h3>
              <p className="text-sm text-gray-600">
                {chat?.participants?.find(p => p._id !== user.id)?.name || 'Seller'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              chat?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {chat?.status || 'active'}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation with a message</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  message.sender._id === user.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender._id === user.id 
                      ? 'bg-blue-600 ml-2' 
                      : 'bg-gray-300 mr-2'
                  }`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Message Container */}
                  <div className="flex flex-col">
                    {/* Sender Name - Show "You" for current user, name for others */}
                    {message.sender._id === user.id ? (
                      <p className="text-xs font-semibold text-gray-600 mb-1">You</p>
                    ) : (
                      <p className="text-xs font-semibold text-gray-600 mb-1">{message.sender.name}</p>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.sender._id === user.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          {chat?.status === 'closed' ? (
            <div className="flex items-center justify-center py-3 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <MessageCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-medium">
                This chat has been closed
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
