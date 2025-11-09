"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Plus,
  LogOut,
  Settings,
  User,
  Home,
  Search,
  Bell,
  Heart,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  averageRating: number;
}

interface DonationStats {
  total: number;
  active: number;
  completed: number;
  urgent: number;
  byCategory: {
    [key: string]: number;
  };
}

interface FeedItem {
  id: string;
  type: "product" | "order" | "message" | "review" | "donation";
  title: string;
  description: string;
  time: string;
  user?: string;
  image?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(
    null
  );
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      FLOOD_RELIEF: "Cứu trợ lũ lụt",
      POVERTY_SUPPORT: "Hỗ trợ nghèo khó",
      EMERGENCY: "Cấp cứu",
      DISASTER_RELIEF: "Cứu trợ thiên tai",
      COMMUNITY_HELP: "Hỗ trợ cộng đồng",
    };
    return categoryNames[category] || category;
  };

  const fetchDonationStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/v1/donations/statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDonationStats(data);
      }
    } catch (error) {
      console.error("Error fetching donation statistics:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Fetch real donation statistics
    fetchDonationStats();

    // Mock stats and feed for demo
    setTimeout(() => {
      setStats({
        totalProducts: 12,
        totalOrders: 48,
        totalSales: 2450000,
        averageRating: 4.8,
      });

      setFeedItems([
        {
          id: "1",
          type: "product",
          title: "Sản phẩm mới được đăng",
          description: "Cà chua organic tươi ngon - 25,000đ/kg",
          time: "2 phút trước",
          user: "Nông trại ABC",
        },
        {
          id: "2",
          type: "order",
          title: "Đơn hàng mới",
          description: "Khách hàng đặt mua 10kg rau xà lách",
          time: "15 phút trước",
          user: "Nguyễn Văn A",
        },
        {
          id: "3",
          type: "donation",
          title: "Quyên góp cứu trợ lũ lụt",
          description: "Hỗ trợ 500kg gạo cho người dân vùng lũ Quảng Bình",
          time: "25 phút trước",
          user: "Quỹ từ thiện ABC",
        },
        {
          id: "4",
          type: "message",
          title: "Tin nhắn mới",
          description: "Có khách hàng quan tâm đến sản phẩm cà rót",
          time: "30 phút trước",
          user: "Trần Thị B",
        },
        {
          id: "5",
          type: "donation",
          title: "Hỗ trợ gia đình khó khăn",
          description: "Quyên góp quần áo và học phẩm cho trẻ em vùng cao",
          time: "45 phút trước",
          user: "Nhóm thiện nguyện DEF",
        },
        {
          id: "6",
          type: "review",
          title: "Đánh giá mới",
          description: "Sản phẩm dưa leo nhận được 5 sao",
          time: "1 giờ trước",
          user: "Lê Văn C",
        },
        {
          id: "5",
          type: "product",
          title: "Sản phẩm hot trending",
          description: "Bí đao xanh - Giảm giá 20% trong tuần này",
          time: "2 giờ trước",
          user: "Vườn xanh XYZ",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");

    // Remove token from cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-5 w-5 text-green-500" />;
      case "order":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "donation":
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="text-2xl font-bold text-green-600">
              GreenConnect
            </Link>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              <Link
                href="/dashboard"
                className="bg-green-100 text-green-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Home className="text-green-500 mr-3 flex-shrink-0 h-6 w-6" />
                Dashboard
              </Link>

              <Link
                href="/marketplace"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Search className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Khám phá chợ
              </Link>

              {(user.role === "SELLER" || user.role === "BOTH") && (
                <Link
                  href="/products"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Package className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                  Quản lý sản phẩm
                </Link>
              )}

              <Link
                href="/orders"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <ShoppingBag className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Quản lý đơn hàng
              </Link>

              <Link
                href="/donations"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Heart className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Trao tặng yêu thương
              </Link>

              <Link
                href="/chat"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <MessageSquare className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Tin nhắn
              </Link>

              <Link
                href="/profile"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <User className="text-gray-400 mr-3 flex-shrink-0 h-6 w-6" />
                Hồ sơ cá nhân
              </Link>
            </nav>
          </div>

          {/* User info & logout */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 text-gray-400 hover:text-red-500"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header for mobile */}
        <header className="md:hidden bg-white shadow">
          <div className="px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-green-600">
              GreenConnect
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Dashboard
              </h1>

              {/* Stats Cards */}
              {(stats || donationStats) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-5">
                  {stats && (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <dl>
                              <dt className="text-xs font-medium text-gray-500 truncate">
                                Sản phẩm
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {stats.totalProducts}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats && (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <ShoppingBag className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <dl>
                              <dt className="text-xs font-medium text-gray-500 truncate">
                                Đơn hàng
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {stats.totalOrders}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats && (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <TrendingUp className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <dl>
                              <dt className="text-xs font-medium text-gray-500 truncate">
                                Doanh thu
                              </dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {stats.totalSales.toLocaleString("vi-VN")}đ
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats && (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Star className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <dl>
                              <dt className="text-xs font-medium text-gray-500 truncate">
                                Đánh giá TB
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {stats.averageRating}/5
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Donation Statistics Cards */}
                  {donationStats && (
                    <>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <Heart className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-medium text-gray-500 truncate">
                                  Tổng quyên góp
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                  {donationStats.total}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <AlertTriangle className="h-5 w-5 text-orange-400" />
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-medium text-gray-500 truncate">
                                  Cần gấp
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                  {donationStats.urgent}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Donation Category Distribution */}
              {donationStats &&
                donationStats.byCategory &&
                Object.keys(donationStats.byCategory).length > 0 && (
                  <div className="mb-5">
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base font-medium text-gray-900 flex items-center">
                          <Heart className="h-4 w-4 text-red-400 mr-2" />
                          Phân bố quyên góp theo danh mục
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(donationStats.byCategory).map(
                            ([category, count]) => {
                              const total = donationStats.total;
                              const percentage =
                                total > 0
                                  ? Math.round((count / total) * 100)
                                  : 0;

                              return (
                                <div key={category} className="relative">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {getCategoryDisplayName(category)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {count} ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-gray-600">
                                Đang hoạt động: {donationStats.active}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                              <span className="text-gray-600">
                                Đã hoàn thành: {donationStats.completed}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Feed Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Feed */}
                <div className="lg:col-span-2">
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        Cập nhật mới nhất
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {feedItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {item.time}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              {item.user && (
                                <p className="text-xs text-gray-400 mt-1">
                                  bởi {item.user}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">
                        Thao tác nhanh
                      </h3>
                    </div>

                    <div className="p-4 space-y-2">
                      {(user.role === "SELLER" || user.role === "BOTH") && (
                        <Link
                          href="/products/create"
                          className="w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm sản phẩm
                        </Link>
                      )}

                      <Link
                        href="/marketplace"
                        className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Tìm sản phẩm
                      </Link>

                      <Link
                        href="/chat"
                        className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Tin nhắn
                      </Link>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">
                        Thống kê nhanh
                      </h3>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Hôm nay</span>
                        <span className="text-sm font-medium text-gray-900">
                          5 đơn hàng mới
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tuần này</span>
                        <span className="text-sm font-medium text-gray-900">
                          23 sản phẩm bán
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Tin nhắn chưa đọc
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
