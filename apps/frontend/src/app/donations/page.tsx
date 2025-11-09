"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Plus,
  Sparkles,
} from "lucide-react";

// Types
interface DonationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  condition?: string;
  description?: string;
  estimatedValue?: number;
}

interface Donation {
  id: string;
  title: string;
  description: string;
  category:
    | "FLOOD_RELIEF"
    | "POVERTY_SUPPORT"
    | "EMERGENCY"
    | "DISASTER_RELIEF"
    | "COMMUNITY_HELP";
  images: string[];
  items: DonationItem[];
  recipientInfo: string;
  recipientContact: string;
  location: string;
  urgencyLevel: number;
  status: "AVAILABLE" | "COMPLETED" | "EXPIRED" | "SUSPENDED";
  expiryDate?: string;
  totalValue?: number;
  notes?: string;
  contactInfo: string;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  donor: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    organization?: string;
  };
}

const categoryOptions = {
  "": "Tất cả danh mục",
  FLOOD_RELIEF: "🌊 Hỗ trợ vùng lũ",
  POVERTY_SUPPORT: "💝 Hoàn cảnh khó khăn",
  EMERGENCY: "🚨 Trường hợp khẩn cấp",
  DISASTER_RELIEF: "🏠 Thiên tai",
  COMMUNITY_HELP: "🤝 Hỗ trợ cộng đồng",
};

const categoryColors: { [key: string]: string } = {
  FLOOD_RELIEF: "bg-blue-100 text-blue-800",
  POVERTY_SUPPORT: "bg-purple-100 text-purple-800",
  EMERGENCY: "bg-red-100 text-red-800",
  DISASTER_RELIEF: "bg-orange-100 text-orange-800",
  COMMUNITY_HELP: "bg-green-100 text-green-800",
};

// Loading Skeleton Component
function DonationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow animate-pulse">
      <div className="h-48 bg-gray-300 rounded-t-xl"></div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
          <div className="h-6 w-20 bg-gray-300 rounded-full ml-3"></div>
        </div>
        <div className="h-6 w-24 bg-gray-300 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-20 bg-gray-300 rounded"></div>
          <div className="h-6 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="flex space-x-4">
            <div className="h-3 w-8 bg-gray-300 rounded"></div>
            <div className="h-3 w-12 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </div>
        <div className="flex items-center pt-4 border-t border-gray-200">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="ml-3 space-y-1 flex-1">
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-2 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-32 h-32 text-8xl mb-6 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 rounded-full animate-pulse">
        💝
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Chưa có trao tặng nào
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        Hãy là người đầu tiên chia sẻ yêu thương và tạo ra những trao tặng ý
        nghĩa cho cộng đồng
      </p>
      <div className="space-y-4">
        <Link
          href="/donations/create"
          className="inline-flex items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="h-6 w-6 mr-3 animate-pulse" />
          Tạo trao tặng đầu tiên
        </Link>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 text-6xl mb-6 flex items-center justify-center bg-red-100 rounded-full">
        ❌
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Lỗi tải dữ liệu
      </h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
    urgencyLevel: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [filters]);

  const fetchDonations = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.urgencyLevel)
        queryParams.append("urgencyLevel", filters.urgencyLevel);

      const response = await fetch(
        `http://localhost:3001/api/v1/donations?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      const data = await response.json();
      setDonations(data.donations || data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch donations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      status: "",
      search: "",
      urgencyLevel: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🌱 Trao tặng yêu thương
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Kết nối những tấm lòng hảo tâm với những hoàn cảnh cần được hỗ trợ
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{donations.length}</div>
                <div className="text-sm text-green-100">Trao tặng</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {donations.filter((d) => d.urgencyLevel >= 3).length}
                </div>
                <div className="text-sm text-green-100">Khẩn cấp</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {donations.filter((d) => d.status === "AVAILABLE").length}
                </div>
                <div className="text-sm text-green-100">Đang hoạt động</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {donations.filter((d) => d.isVerified).length}
                </div>
                <div className="text-sm text-green-100">Đã xác minh</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Tìm kiếm trao tặng..."
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                  hasActiveFilters
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
                {hasActiveFilters && (
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {Object.values(filters).filter((v) => v !== "").length}
                  </span>
                )}
              </button>

              <Link
                href="/donations/create"
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo trao tặng
              </Link>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.entries(categoryOptions).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="AVAILABLE">Đang hoạt động</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="SUSPENDED">Tạm dừng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={filters.urgencyLevel}
                    onChange={(e) =>
                      handleFilterChange("urgencyLevel", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Tất cả mức độ</option>
                    <option value="4">Rất khẩn cấp</option>
                    <option value="3">Khẩn cấp</option>
                    <option value="2">Ưu tiên</option>
                    <option value="1">Bình thường</option>
                  </select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {Object.entries(categoryOptions)
              .slice(1)
              .map(([key, label]) => (
                <Link
                  key={key}
                  href={`/donations/category/${key}`}
                  className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category === key
                      ? categoryColors[key] || "bg-gray-100 text-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <DonationCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={fetchDonations} />
        ) : donations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {hasActiveFilters ? "Kết quả tìm kiếm" : "Tất cả trao tặng"}
                <span className="text-gray-500 font-normal ml-2">
                  ({donations.length})
                </span>
              </h2>
            </div>

            {/* Donation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation, index) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DonationCard({
  donation,
  index,
}: {
  donation: Donation;
  index: number;
}) {
  const isUrgent = donation.urgencyLevel >= 4;
  const isExpiringSoon =
    donation.expiryDate &&
    new Date(donation.expiryDate).getTime() - Date.now() <
      7 * 24 * 60 * 60 * 1000;

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return "text-red-600 bg-red-100 border-red-200";
    if (level >= 3) return "text-orange-600 bg-orange-100 border-orange-200";
    if (level >= 2) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-green-600 bg-green-100 border-green-200";
  };

  const getUrgencyText = (level: number) => {
    if (level >= 4) return "Rất khẩn cấp";
    if (level >= 3) return "Khẩn cấp";
    if (level >= 2) return "Ưu tiên";
    return "Bình thường";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className={`bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isUrgent ? "ring-2 ring-red-200" : ""
      }`}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Image */}
      {donation.images.length > 0 && (
        <div className="relative">
          <img
            src={donation.images[0]}
            alt={donation.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          {isUrgent && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                KHẨN CẤP
              </span>
            </div>
          )}
          {donation.isVerified && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                ✓ Đã xác minh
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/donations/${donation.id}`} className="group">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                {donation.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {donation.description}
            </p>
          </div>

          <span
            className={`ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(donation.urgencyLevel)}`}
          >
            {donation.urgencyLevel >= 3 && (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {getUrgencyText(donation.urgencyLevel)}
          </span>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${categoryColors[donation.category] || "bg-gray-100 text-gray-800"}`}
          >
            {categoryOptions[
              donation.category as keyof typeof categoryOptions
            ]?.replace(/^[^\s]+ /, "") || donation.category}
          </span>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {donation.items.slice(0, 2).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {item.name} ({item.quantity} {item.unit})
              </span>
            ))}
            {donation.items.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                +{donation.items.length - 2} khác
              </span>
            )}
          </div>
        </div>

        {/* Location and Warnings */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{donation.location}</span>
          </div>

          {isExpiringSoon && (
            <span className="inline-flex items-center text-xs text-yellow-600">
              <Clock className="h-3 w-3 mr-1" />
              Sắp hết hạn
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {donation.viewCount}
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(donation.createdAt)}
            </div>
          </div>

          <Link
            href={`/donations/${donation.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>

        {/* Donor Info */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          {donation.donor.avatar ? (
            <img
              src={donation.donor.avatar}
              alt={donation.donor.fullName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {donation.donor.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {donation.donor.fullName}
            </p>
            {donation.donor.organization && (
              <p className="text-xs text-gray-500 truncate">
                {donation.donor.organization}
              </p>
            )}
          </div>
          <Heart className="h-4 w-4 text-red-500" />
        </div>
      </div>
    </div>
  );
}
