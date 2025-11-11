"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  avatar?: string;
  organization?: string;
}

interface ChatInitiatorProps {
  user: User;
  children?: React.ReactNode;
  className?: string;
}

export default function ChatInitiator({
  user,
  children,
  className,
}: ChatInitiatorProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId: user.id }),
        }
      );

      if (response.ok) {
        // Navigate to chat page
        router.push("/chat");
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (children) {
    return (
      <div onClick={startChat} className={className}>
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className={`
        flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 
        text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ""}
      `}
    >
      <MessageCircle className="h-4 w-4" />
      <span>{loading ? "Đang tạo..." : "Nhắn tin"}</span>
    </button>
  );
}
