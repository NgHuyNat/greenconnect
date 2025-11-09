"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  smileys: {
    name: "Mặt cười",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
    ],
  },
  gestures: {
    name: "Cử chỉ",
    emojis: [
      "👍",
      "👎",
      "👌",
      "🤝",
      "👏",
      "🙏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "👊",
      "✊",
      "🤛",
      "🤜",
      "👋",
      "🤚",
      "🖐️",
      "✋",
    ],
  },
  hearts: {
    name: "Trái tim",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
    ],
  },
  objects: {
    name: "Vật phẩm",
    emojis: [
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🏆",
      "🥇",
      "🌟",
      "⭐",
      "💫",
      "✨",
      "🔥",
      "💯",
      "❗",
      "❓",
      "💡",
      "🚀",
    ],
  },
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmojiPicker({
  onEmojiSelect,
  isOpen,
  onClose,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof EMOJI_CATEGORIES>("smileys");

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72 z-10">
      {/* Categories */}
      <div className="flex space-x-1 mb-3 border-b border-gray-200 pb-2">
        {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() =>
              setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)
            }
            className={`px-2 py-1 text-xs rounded ${
              activeCategory === key
                ? "bg-green-100 text-green-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
