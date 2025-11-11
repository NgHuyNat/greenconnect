"use client";

import { API_URL } from "@/lib/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Upload, MapPin, AlertTriangle } from "lucide-react";

// Types
interface DonationItem {
  name: string;
  quantity: number;
  unit: string;
  condition?: string;
  description?: string;
  estimatedValue?: number;
}

const categoryOptions = {
  FLOOD_RELIEF: "Hỗ trợ vùng lũ",
  POVERTY_SUPPORT: "Hoàn cảnh khó khăn",
  EMERGENCY: "Trường hợp khẩn cấp",
  DISASTER_RELIEF: "Thiên tai",
  COMMUNITY_HELP: "Hỗ trợ cộng đồng",
};

const urgencyOptions = [
  { value: 1, label: "Bình thường", color: "text-green-600" },
  { value: 2, label: "Ưu tiên", color: "text-yellow-600" },
  { value: 3, label: "Khẩn cấp", color: "text-orange-600" },
  { value: 4, label: "Rất khẩn cấp", color: "text-red-600" },
];

export default function CreateDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    images: [] as string[],
    recipientInfo: "",
    recipientContact: "",
    location: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    urgencyLevel: 1,
    expiryDate: "",
    totalValue: undefined as number | undefined,
    notes: "",
    contactInfo: "",
  });

  const [items, setItems] = useState<DonationItem[]>([
    { name: "", quantity: 1, unit: "cái" },
  ]);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API_URL}/upload/multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const data = await response.json();
      setImageUrls((prev) => [...prev, ...data.urls]);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const donationData = {
        ...formData,
        items: items.filter((item) => item.name.trim() !== ""),
        images: imageUrls,
      };

      const response = await fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(donationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create donation");
      }

      router.push(`/donations/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create donation"
      );
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit: "cái" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof DonationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addImageUrl = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && url.trim()) {
      setImageUrls([...imageUrls, url.trim()]);
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo trao tặng mới
              </h1>
              <p className="text-gray-600">
                Chia sẻ yêu thương với những hoàn cảnh khó khăn
              </p>
            </div>
            <Link
              href="/donations"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tiêu đề trao tặng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="VD: Hỗ trợ gạo, áo quần cho người dân vùng lũ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả chi tiết *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Mô tả chi tiết về hoàn cảnh và những gì bạn muốn trao tặng..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Danh mục *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {Object.entries(categoryOptions).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgencyLevel: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {urgencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Hình ảnh minh họa
            </h2>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block">
                  <div className="flex items-center justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <div className="text-center">
                      {uploadingImages ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-sm text-gray-600">
                        {uploadingImages
                          ? "Đang upload..."
                          : "Chọn ảnh từ thiết bị"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF tối đa 10MB mỗi ảnh
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>
              </div>

              {/* URL Input */}
              <div className="text-center text-gray-500 text-sm">hoặc</div>

              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Thêm hình ảnh từ URL
              </button>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Hình ảnh đã thêm ({imageUrls.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Hình ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={() => removeImageUrl(index)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Donation Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Danh sách vật phẩm trao tặng
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm vật phẩm
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Vật phẩm {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tên vật phẩm *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="VD: Gạo tẻ, Áo mưa, Mì tôm..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Đơn vị
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="cái">cái</option>
                        <option value="kg">kg</option>
                        <option value="thùng">thùng</option>
                        <option value="bao">bao</option>
                        <option value="lít">lít</option>
                        <option value="chai">chai</option>
                        <option value="hộp">hộp</option>
                        <option value="bộ">bộ</option>
                        <option value="tấn">tấn</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tình trạng
                      </label>
                      <input
                        type="text"
                        value={item.condition || ""}
                        onChange={(e) =>
                          updateItem(index, "condition", e.target.value)
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="VD: Mới, Đã qua sử dụng nhẹ, Tốt..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giá trị ước tính (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.estimatedValue || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "estimatedValue",
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Giá trị ước tính..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả thêm
                    </label>
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="Mô tả thêm về vật phẩm (tùy chọn)..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Thông tin người nhận
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thông tin người nhận *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.recipientInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientInfo: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Thông tin về người/nhóm người cần hỗ trợ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Liên hệ người nhận *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientContact: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Số điện thoại, địa chỉ hoặc thông tin liên hệ khác"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Địa điểm *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500"
                      placeholder="Tỉnh/thành phố, quận/huyện, phường/xã..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Thông tin bổ sung
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hạn cuối trao tặng
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thông tin liên hệ của bạn *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, contactInfo: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Số điện thoại hoặc email để liên hệ"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Ghi chú thêm
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Các thông tin khác bạn muốn chia sẻ..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/donations"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                "Tạo trao tặng"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
