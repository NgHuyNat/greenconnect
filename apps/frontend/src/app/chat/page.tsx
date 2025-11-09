"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import { useChat } from "../../hooks/useChat";
import EmojiPicker from "../../components/EmojiPicker";
import NewChatModal from "../../components/NewChatModal";

interface User {
  id: string;
  fullName: string;
  email?: string;
  avatar?: string;
  organization?: string;
  role?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  otherParticipant: User;
  lastMessage: Message | null;
  updatedAt: string;
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get current user ID
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  // Check if conversation has unread messages
  const hasUnreadMessages = (conversation: Conversation) => {
    return (
      conversation.lastMessage &&
      !conversation.lastMessage.isRead &&
      conversation.lastMessage.senderId !== currentUserId
    );
  };

  const {
    conversations,
    messages,
    typingUsers,
    isConnected,
    loading,
    fetchConversations,
    joinConversation,
    leaveConversation,
    sendMessage,
    createConversation,
    startTyping,
    stopTyping,
    clearMessages,
  } = useChat();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle query parameter to open specific conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");

    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        setShowMobileChat(true);
      }
    }
  }, [conversations]);

  // Join conversation when selected and mark messages as read
  useEffect(() => {
    if (selectedConversation) {
      clearMessages();
      joinConversation(selectedConversation.id);

      // Mark last message as read if it's from the other participant
      if (
        selectedConversation.lastMessage &&
        !selectedConversation.lastMessage.isRead &&
        selectedConversation.lastMessage.senderId !== currentUserId
      ) {
        markMessageAsRead(selectedConversation.lastMessage.id);
      }
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }
    };
  }, [
    selectedConversation,
    joinConversation,
    leaveConversation,
    clearMessages,
    currentUserId,
  ]);

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/v1/chat/messages/${messageId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh conversations to update read status
      fetchConversations();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);

    const success = await sendMessage(
      selectedConversation.id,
      newMessage.trim(),
      selectedConversation.otherParticipant?.id
    );

    if (success) {
      setNewMessage("");
    }

    setSending(false);
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Handle typing indicators
    if (selectedConversation) {
      if (value.trim()) {
        startTyping(
          selectedConversation.id,
          selectedConversation.otherParticipant?.id
        );

        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing
        const timeout = setTimeout(() => {
          stopTyping(
            selectedConversation.id,
            selectedConversation.otherParticipant?.id
          );
        }, 2000);

        setTypingTimeout(timeout);
      } else {
        stopTyping(
          selectedConversation.id,
          selectedConversation.otherParticipant?.id
        );
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatConversationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("vi-VN");
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherParticipant &&
      conv.otherParticipant.fullName &&
      conv.otherParticipant.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const getCurrentUserId = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  };

  const handleSelectUser = async (user: User) => {
    setCreatingConversation(true);
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(
        (conv) => conv.otherParticipant?.id === user.id
      );

      if (existingConv) {
        setSelectedConversation(existingConv);
        setShowMobileChat(true);
      } else {
        // Create new conversation
        const newConv = await createConversation(user.id);
        if (newConv) {
          setSelectedConversation(newConv);
          setShowMobileChat(true);
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setCreatingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div
        className={`${
          showMobileChat ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-80 bg-white border-r border-gray-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-6 w-6 text-green-500 mr-2" />
              Tin nhắn
            </h1>
            <button
              onClick={() => {
                setShowNewChatModal(true);
              }}
              className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              title="Tạo cuộc trò chuyện mới"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowMobileChat(true);
                  }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? "bg-green-50 border-r-2 border-green-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {conversation.otherParticipant?.avatar ? (
                        <img
                          src={conversation.otherParticipant.avatar}
                          alt={
                            conversation.otherParticipant?.fullName || "User"
                          }
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {conversation.otherParticipant?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.fullName || "User"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage &&
                              formatConversationTime(
                                conversation.lastMessage.createdAt
                              )}
                          </span>
                          {/* Unread indicator */}
                          {hasUnreadMessages(conversation) && (
                            <div className="h-2.5 w-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage
                          ? conversation.lastMessage.content
                          : "Chưa có tin nhắn"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`${
          !showMobileChat ? "hidden" : "flex"
        } md:flex flex-1 flex-col`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {selectedConversation.otherParticipant?.avatar ? (
                    <img
                      src={selectedConversation.otherParticipant.avatar}
                      alt={
                        selectedConversation.otherParticipant.fullName || "User"
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {selectedConversation.otherParticipant?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </span>
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm font-medium text-gray-900">
                      {selectedConversation.otherParticipant?.fullName ||
                        "User"}
                    </h2>
                    {typingUsers.size > 0 ? (
                      <p className="text-xs text-green-600">Đang nhập...</p>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <div
                          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <p className="text-xs text-gray-500">
                          {isConnected
                            ? selectedConversation.otherParticipant
                                ?.organization || "Đang hoạt động"
                            : "Đang kết nối..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === getCurrentUserId();
                  const showAvatar =
                    index === messages.length - 1 ||
                    messages[index + 1]?.senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-xs lg:max-w-md ${
                          isOwn ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {showAvatar && !isOwn && (
                          <div className="flex-shrink-0 mr-2">
                            {selectedConversation.otherParticipant?.avatar ? (
                              <img
                                src={
                                  selectedConversation.otherParticipant.avatar
                                }
                                alt={
                                  selectedConversation.otherParticipant
                                    .fullName || "User"
                                }
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {selectedConversation.otherParticipant?.fullName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-900"
                          } ${!showAvatar && !isOwn ? "ml-10" : ""}`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? "text-green-100" : "text-gray-500"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start mt-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        Đang nhập...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="h-5 w-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: "40px", maxHeight: "120px" }}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectUser={handleSelectUser}
      />

      {/* Creating Conversation Overlay */}
      {creatingConversation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-700">Đang tạo cuộc trò chuyện...</p>
          </div>
        </div>
      )}
    </div>
  );
}
