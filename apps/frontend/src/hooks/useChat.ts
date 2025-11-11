"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  fullName: string;
  avatar?: string;
  organization?: string;
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

export function useChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Load conversations from localStorage on initial render
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_conversations");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error("Error parsing stored conversations:", error);
        }
      }
    }
    return [];
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: { token },
        transports: ["websocket"],
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("new_message", (data: any) => {
      // Handle different response structures from backend
      const message = data?.message || data;
      const conversationId =
        data?.conversationId ||
        message?.conversationId ||
        message?.conversation?.id;

      if (!message || !message.id) {
        console.error("Invalid message data:", data);
        return;
      }

      // Add message to current messages if it's for the active conversation
      setMessages((prev) => {
        const isExistingMessage = prev.some((msg) => msg?.id === message?.id);
        if (!isExistingMessage && message) {
          return [...prev, message];
        }
        return prev;
      });

      // Update conversation list
      if (conversationId && message) {
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: message,
                    updatedAt:
                      message?.createdAt ||
                      message?.updatedAt ||
                      new Date().toISOString(),
                  }
                : conv
            )
            .sort(
              (a, b) =>
                new Date(b?.updatedAt || 0).getTime() -
                new Date(a?.updatedAt || 0).getTime()
            )
        );
      }
    });

    socketInstance.on(
      "user_typing",
      (data: { userId: string; conversationId: string }) => {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    );

    socketInstance.on(
      "user_stopped_typing",
      (data: { userId: string; conversationId: string }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    );

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Persist conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        // Also persist to localStorage
        localStorage.setItem("chat_conversations", JSON.stringify(data));
      } else {
        console.error("Failed to fetch conversations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/chat/conversations/${conversationId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data.data || []);
      } else {
        console.error("Failed to fetch messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Join conversation
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (socket) {
        socket.emit("join_conversation", { conversationId });
        fetchMessages(conversationId);
      }
    },
    [socket, fetchMessages]
  );

  // Leave conversation
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (socket) {
        socket.emit("leave_conversation", { conversationId });
      }
    },
    [socket]
  );

  // Send message
  const sendMessage = useCallback(
    async (conversationId: string, content: string, recipientId: string) => {
      if (!socket || !content.trim()) return false;

      try {
        socket.emit("send_message", {
          conversationId,
          content: content.trim(),
          recipientId,
        });
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    },
    [socket]
  );

  // Create conversation
  const createConversation = useCallback(async (recipientId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientId }),
        }
      );

      if (response.ok) {
        const conversation = await response.json();
        setConversations((prev) => {
          const updated = [conversation, ...prev];
          // Persist to localStorage
          localStorage.setItem("chat_conversations", JSON.stringify(updated));
          return updated;
        });
        return conversation;
      } else {
        console.error("Failed to create conversation:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }, []);

  // Start typing
  const startTyping = useCallback(
    (conversationId: string, recipientId: string) => {
      if (socket) {
        socket.emit("typing_start", { conversationId, recipientId });
      }
    },
    [socket]
  );

  // Stop typing
  const stopTyping = useCallback(
    (conversationId: string, recipientId: string) => {
      if (socket) {
        socket.emit("typing_stop", { conversationId, recipientId });
      }
    },
    [socket]
  );

  // Clear messages when switching conversations
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    socket,
    conversations,
    messages,
    typingUsers,
    isConnected,
    loading,
    fetchConversations,
    fetchMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    createConversation,
    startTyping,
    stopTyping,
    clearMessages,
  };
}
