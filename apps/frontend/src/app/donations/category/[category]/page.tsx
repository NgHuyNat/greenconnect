"use client";

import { API_URL } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  Heart,
  Eye,
  Calendar,
  User,
} from "lucide-react";

// Types
interface DonationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Donor {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  organization?: string;
}

interface Donation {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  items: DonationItem[];
  recipientInfo: string;
  location: string;
  urgencyLevel: number;
  status: string;
  expiryDate?: string;
  totalValue?: number;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  donor: Donor;
}

const categoryInfo: {
  [key: string]: {
    label: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
  };
} = {
  FLOOD_RELIEF: {
    label: "Hỗ trợ vùng lũ",
    description: "Cứu trợ và hỗ trợ người dân vùng lũ lụt, thiên tai",
    icon: "🌊",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
  },
  POVERTY_SUPPORT: {
    label: "Hoàn cảnh khó khăn",
    description: "Hỗ trợ các gia đình có hoàn cảnh kinh tế khó khăn",
    icon: "💝",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
  },
  EMERGENCY: {
    label: "Trường hợp khẩn cấp",
    description: "Hỗ trợ khẩn cấp trong các tình huống cấp bách",
    icon: "🚨",
    color: "text-red-800",
    bgColor: "bg-red-100",
  },
  DISASTER_RELIEF: {
    label: "Thiên tai",
    description: "Cứu trợ thiên tai, động đất, bão lụt",
    icon: "🏠",
    color: "text-orange-800",
    bgColor: "bg-orange-100",
  },
  COMMUNITY_HELP: {
    label: "Hỗ trợ cộng đồng",
    description: "Các hoạt động hỗ trợ phát triển cộng đồng",
    icon: "🤝",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const category = params.category as string;
  const categoryData = categoryInfo[category];

  useEffect(() => {
    if (category) {
      fetchDonations();
    }
  }, [category, searchTerm, urgencyFilter, statusFilter]);

  const fetchDonations = async () => {
    try {
      const queryParams = new URLSearchParams({
        category,
        ...(searchTerm && { search: searchTerm }),
        ...(urgencyFilter && { urgencyLevel: urgencyFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(
        `${API_URL}/donations/category/${category}?${queryParams}`,
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

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return "text-red-600 bg-red-100";
    if (level >= 3) return "text-orange-600 bg-orange-100";
    if (level >= 2) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
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
      year: "numeric",
    });
  };

  const isExpired = (expiryDate?: string) => {
    return expiryDate && new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    return (
      expiryDate &&
      new Date(expiryDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
      new Date(expiryDate) > new Date()
    );
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            ❌ Danh mục không tồn tại
          </div>
          <Link
            href="/donations"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/donations"
                className="flex items-center text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Tất cả trao tặng
              </Link>

              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg ${categoryData.bgColor} flex items-center justify-center text-2xl`}
                >
                  {categoryData.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {categoryData.label}
                  </h1>
                  <p className="text-gray-600">{categoryData.description}</p>
                </div>
              </div>
            </div>

            <Link
              href="/donations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Tạo trao tặng
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder={`Tìm kiếm trong ${categoryData.label.toLowerCase()}...`}
              />
            </div>

            {/* Urgency Filter */}
            <div className="sm:w-48">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả mức độ</option>
                <option value="4">Rất khẩn cấp</option>
                <option value="3">Khẩn cấp</option>
                <option value="2">Ưu tiên</option>
                <option value="1">Bình thường</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="AVAILABLE">Đang hoạt động</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="SUSPENDED">Tạm dừng</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {donations.length}
            </div>
            <div className="text-sm text-gray-600">
              Trao tặng trong danh mục
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {donations.filter((d) => d.urgencyLevel >= 3).length}
            </div>
            <div className="text-sm text-gray-600">Khẩn cấp</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {donations.filter((d) => d.status === "AVAILABLE").length}
            </div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {donations.filter((d) => d.isVerified).length}
            </div>
            <div className="text-sm text-gray-600">Đã xác minh</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">❌ Lỗi tải dữ liệu</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchDonations()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Thử lại
            </button>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryData.icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có trao tặng nào trong danh mục này
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy là người đầu tiên chia sẻ yêu thương cho{" "}
              {categoryData.label.toLowerCase()}
            </p>
            <Link
              href="/donations/create"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Heart className="h-5 w-5 mr-2" />
              Tạo trao tặng đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                {/* Image */}
                {donation.images.length > 0 && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={donation.images[0]}
                      alt={donation.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {donation.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {donation.description}
                      </p>
                    </div>

                    <span
                      className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(donation.urgencyLevel)}`}
                    >
                      {donation.urgencyLevel >= 4 && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {getUrgencyText(donation.urgencyLevel)}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {donation.items.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {item.name} ({item.quantity} {item.unit})
                        </span>
                      ))}
                      {donation.items.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          +{donation.items.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location and Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{donation.location}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {donation.isVerified && (
                        <span className="inline-flex items-center text-xs text-green-600">
                          ✓ Xác minh
                        </span>
                      )}
                      {isExpired(donation.expiryDate) && (
                        <span className="inline-flex items-center text-xs text-red-600">
                          Hết hạn
                        </span>
                      )}
                      {isExpiringSoon(donation.expiryDate) && (
                        <span className="inline-flex items-center text-xs text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Sắp hết hạn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </div>

                  {/* Donor Info */}
                  <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    {donation.donor.avatar ? (
                      <img
                        src={donation.donor.avatar}
                        alt={donation.donor.fullName}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {donation.donor.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-2 min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {donation.donor.fullName}
                      </p>
                      {donation.donor.organization && (
                        <p className="text-xs text-gray-500 truncate">
                          {donation.donor.organization}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
