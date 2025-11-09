"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  MapPin,
  Tag,
  Star,
  Calendar,
  Loader2,
} from "lucide-react";
import QuickChatButton from "../../../components/QuickChatButton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  location: string;
  condition: string;
  stock: number;
  images: string[];
  seller: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProductDetail(params.id as string);
    }
  }, [params.id]);

  const fetchProductDetail = async (productId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/v1/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        alert("Không thể tải thông tin sản phẩm");
        router.push("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Đã có lỗi xảy ra");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;

    setDeletingProduct(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/v1/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        router.push("/products");
      } else {
        alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getCurrentUserId = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết sản phẩm
              </h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={
                    product.images[selectedImage] ||
                    "https://via.placeholder.com/600x600?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg ${
                        selectedImage === index
                          ? "ring-2 ring-green-500"
                          : "ring-1 ring-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-green-600">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xl text-gray-500">/{product.unit}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center text-gray-700">
                  <Package className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Tồn kho:</span>
                  <span>
                    {product.stock} {product.unit}
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Địa điểm:</span>
                  <span>{product.location || "Chưa cập nhật"}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Tag className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Tình trạng:</span>
                  <span>
                    {product.condition === "NEW"
                      ? "Mới"
                      : product.condition === "LIKE_NEW"
                        ? "Như mới"
                        : product.condition === "GOOD"
                          ? "Tốt"
                          : "Khá"}
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium mr-2">Ngày đăng:</span>
                  <span>
                    {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin người bán
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium">Tên:</span>{" "}
                    {product.seller.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {product.seller.email}
                  </p>
                  {product.seller.phone && (
                    <p>
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {product.seller.phone}
                    </p>
                  )}

                  {/* Quick Chat Button */}
                  {getCurrentUserId() !== product.seller.id && (
                    <div className="pt-2">
                      <QuickChatButton
                        userId={product.seller.id}
                        userName={product.seller.fullName}
                        size="md"
                        variant="primary"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="border-t border-gray-200 px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Mô tả sản phẩm
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleDeleteCancel}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xóa sản phẩm
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa sản phẩm "{product.name}"?
                        Hành động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={deletingProduct}
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deletingProduct ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa"
                  )}
                </button>
                <button
                  type="button"
                  disabled={deletingProduct}
                  onClick={handleDeleteCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
