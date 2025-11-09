"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Heart,
  Share2,
  Flag,
  User,
  Calendar,
  Package,
  Eye,
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

interface Donor {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  organization?: string;
  phone?: string;
}

interface Donation {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  items: DonationItem[];
  recipientInfo: string;
  recipientContact: string;
  location: string;
  latitude?: number;
  longitude?: number;
  urgencyLevel: number;
  status: string;
  expiryDate?: string;
  totalValue?: number;
  notes?: string;
  contactInfo: string;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  donor: Donor;
}

const categoryLabels: { [key: string]: string } = {
  FLOOD_RELIEF: "Hỗ trợ vùng lũ",
  POVERTY_SUPPORT: "Hoàn cảnh khó khăn",
  EMERGENCY: "Trường hợp khẩn cấp",
  DISASTER_RELIEF: "Thiên tai",
  COMMUNITY_HELP: "Hỗ trợ cộng đồng",
};

const categoryColors: { [key: string]: string } = {
  FLOOD_RELIEF: "bg-blue-100 text-blue-800",
  POVERTY_SUPPORT: "bg-purple-100 text-purple-800",
  EMERGENCY: "bg-red-100 text-red-800",
  DISASTER_RELIEF: "bg-orange-100 text-orange-800",
  COMMUNITY_HELP: "bg-green-100 text-green-800",
};

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchDonation(params.id as string);
    }
  }, [params.id]);

  const fetchDonation = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/donations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donation");
      }

      const data = await response.json();
      setDonation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch donation");
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

  const isExpired =
    donation?.expiryDate && new Date(donation.expiryDate) < new Date();
  const isExpiringSoon =
    donation?.expiryDate &&
    new Date(donation.expiryDate).getTime() - Date.now() <
      7 * 24 * 60 * 60 * 1000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (navigator.share && donation) {
      try {
        await navigator.share({
          title: donation.title,
          text: donation.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Sharing failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link vào clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Lỗi tải dữ liệu</div>
          <p className="text-gray-600 mb-4">
            {error || "Không tìm thấy trao tặng"}
          </p>
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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/donations"
                className="flex items-center text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại
              </Link>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[donation.category] || "bg-gray-100 text-gray-800"}`}
                >
                  {categoryLabels[donation.category] || donation.category}
                </span>
                {donation.isVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Đã xác minh
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Flag className="h-4 w-4 mr-2" />
                Báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Urgency */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {donation.title}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(donation.urgencyLevel)}`}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {getUrgencyText(donation.urgencyLevel)}
                </span>
              </div>

              {/* Status and Expiry Warnings */}
              {(isExpired || isExpiringSoon) && (
                <div
                  className={`p-3 rounded-md mb-4 ${isExpired ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}
                >
                  <div className="flex items-center">
                    <Clock
                      className={`h-5 w-5 mr-2 ${isExpired ? "text-red-600" : "text-yellow-600"}`}
                    />
                    <span
                      className={`text-sm font-medium ${isExpired ? "text-red-800" : "text-yellow-800"}`}
                    >
                      {isExpired
                        ? "Đã hết hạn trao tặng"
                        : "Sắp hết hạn trao tặng"}
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {donation.viewCount} lượt xem
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(donation.createdAt)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {donation.location}
                </div>
              </div>
            </div>

            {/* Images */}
            {donation.images.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={donation.images[selectedImageIndex]}
                    alt={`Hình ${selectedImageIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                </div>
                {donation.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {donation.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index
                              ? "border-green-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {donation.description}
                </p>
              </div>
            </div>

            {/* Donation Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Danh sách vật phẩm trao tặng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donation.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <span className="text-sm font-medium text-green-600">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    {item.condition && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Tình trạng:</span>{" "}
                        {item.condition}
                      </p>
                    )}

                    {item.estimatedValue && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Giá trị:</span>{" "}
                        {formatCurrency(item.estimatedValue)}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {donation.totalValue && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      Tổng giá trị ước tính:
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(donation.totalValue)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin người nhận
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Đối tượng cần hỗ trợ:
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {donation.recipientInfo}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Thông tin liên hệ:
                  </h3>
                  <p className="text-gray-700">{donation.recipientContact}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {donation.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ghi chú thêm
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {donation.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Donor Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Thông tin người trao tặng
                </h3>

                <div className="flex items-center mb-4">
                  {donation.donor.avatar ? (
                    <img
                      src={donation.donor.avatar}
                      alt={donation.donor.fullName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {donation.donor.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {donation.donor.fullName}
                    </p>
                    {donation.donor.organization && (
                      <p className="text-sm text-gray-600">
                        {donation.donor.organization}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Username:</span>
                    <span className="text-gray-700 ml-2">
                      @{donation.donor.username}
                    </span>
                  </p>

                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Liên hệ:</span>
                    <span className="text-gray-700 ml-2">
                      {donation.contactInfo}
                    </span>
                  </p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Liên hệ hỗ trợ
                </h3>

                <div className="space-y-3">
                  <a
                    href={`tel:${donation.contactInfo}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Gọi điện thoại
                  </a>

                  <a
                    href={`sms:${donation.contactInfo}?body=Xin chào, tôi quan tâm đến trao tặng "${donation.title}"`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Gửi tin nhắn
                  </a>

                  <Link
                    href={`/chat?user=${donation.donor.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Chat trực tiếp
                  </Link>
                </div>
              </div>

              {/* Expiry Date */}
              {donation.expiryDate && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Thời hạn trao tặng
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">
                      {formatDate(donation.expiryDate)}
                    </span>
                  </div>

                  {isExpiringSoon && !isExpired && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">⚠️ Sắp hết hạn!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Địa điểm
                </h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{donation.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
