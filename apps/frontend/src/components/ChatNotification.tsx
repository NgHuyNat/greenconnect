"use client";

import { useEffect, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Notification {
  id: string;
  message: Message;
  conversationId: string;
  timestamp: number;
}

export default function ChatNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: { token },
      }
    );

    socketInstance.on(
      "new_message",
      (data: { message: Message; conversationId: string }) => {
        // Only show notification if not on chat page
        if (!window.location.pathname.includes("/chat")) {
          const notification: Notification = {
            id: `${data.message.id}_${Date.now()}`,
            message: data.message,
            conversationId: data.conversationId,
            timestamp: Date.now(),
          };

          setNotifications((prev) => [...prev, notification]);

          // Auto remove after 5 seconds
          setTimeout(() => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== notification.id)
            );
          }, 5000);
        }
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.message.sender.avatar ? (
                <img
                  src={notification.message.sender.avatar}
                  alt={notification.message.sender.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {notification.message.sender.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message.sender.fullName}
                </p>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {notification.message.content}
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center mt-2 text-xs text-green-600 hover:text-green-700"
                onClick={() => dismissNotification(notification.id)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Trả lời
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
