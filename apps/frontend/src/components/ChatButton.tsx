"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface UnreadCount {
  total: number;
}

export default function ChatButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
      {
        auth: { token },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Chat button connected");
    });

    socketInstance.on("new_message", () => {
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(socketInstance);

    // Fetch initial unread count
    fetchUnreadCount();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/v1/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const conversations = await response.json();
        // Count unread messages (this would need backend support)
        // For now, just show if there are any conversations
        setUnreadCount(conversations.length > 0 ? 0 : 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Link
          href="/chat"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Link>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Tin nhắn
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
