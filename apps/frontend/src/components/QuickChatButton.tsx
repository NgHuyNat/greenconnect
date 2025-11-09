"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";

interface QuickChatButtonProps {
  userId: string;
  userName: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export default function QuickChatButton({
  userId,
  userName,
  size = "md",
  variant = "primary",
  className = "",
}: QuickChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Get current user ID
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

  // Don't render button if trying to chat with yourself
  if (currentUserId === userId) {
    return null;
  }

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Check if conversation exists
      const conversationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/v1/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        const existingConv = conversations.find(
          (conv: any) => conv.otherParticipant.id === userId
        );

        if (existingConv) {
          // Redirect to existing conversation
          router.push(`/chat?conversation=${existingConv.id}`);
          return;
        }
      }

      // Create new conversation
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/v1/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientId: userId }),
        }
      );

      if (response.ok) {
        const conversation = await response.json();
        router.push(`/chat?conversation=${conversation.id}`);
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: "bg-green-500 hover:bg-green-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border-2 border-green-500 text-green-500 hover:bg-green-50",
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      title={`Nhắn tin với ${userName}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Nhắn tin
    </button>
  );
}
