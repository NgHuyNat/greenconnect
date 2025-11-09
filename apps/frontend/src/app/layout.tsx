import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ChatNotification from "@/components/ChatNotification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenConnect - Kết nối cung cầu nông sản",
  description:
    "Nền tảng kết nối người bán và người mua nông sản trực tiếp, minh bạch và hiệu quả",
  keywords: "nông sản, kết nối, bán hàng, mua hàng, thực phẩm sạch",
  authors: [{ name: "GreenConnect Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <ChatNotification />
      </body>
    </html>
  );
}
