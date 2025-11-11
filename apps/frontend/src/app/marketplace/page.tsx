"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Star,
  ShoppingCart,
  Eye,
  MessageCircle,
} from "lucide-react";
import QuickChatButton from "../../components/QuickChatButton";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  location: string;
  images: string[];
  seller: {
    id: string;
    fullName: string;
    phone: string;
  };
  averageRating: number;
  reviewCount: number;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const categories = [
    "Rau củ",
    "Trái cây",
    "Ngũ cốc",
    "Thảo mộc",
    "Hoa",
    "Gia vị",
  ];

  const locations = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Đà Lạt"];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedLocation, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedLocation) params.append("location", selectedLocation);
      params.append("page", currentPage.toString());
      params.append("limit", "12");

      const response = await fetch(`${API_URL}/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data || []);
      } else {
        console.error("Failed to fetch products");
        // Mock data for demo
        setProducts([
          {
            id: "1",
            name: "Cà chua organic",
            description: "Cà chua tươi ngon, trồng theo phương pháp organic",
            price: 25000,
            unit: "kg",
            category: "Rau củ",
            location: "Đà Lạt",
            images: ["https://via.placeholder.com/400x300?text=Cà+chua"],
            seller: {
              id: "1",
              fullName: "Nguyễn Văn A",
              phone: "0901234567",
            },
            averageRating: 4.5,
            reviewCount: 12,
          },
          {
            id: "2",
            name: "Rau muống tươi",
            description: "Rau muống tươi xanh, thu hoạch trong ngày",
            price: 15000,
            unit: "kg",
            category: "Rau củ",
            location: "Hồ Chí Minh",
            images: ["https://via.placeholder.com/400x300?text=Rau+muống"],
            seller: {
              id: "2",
              fullName: "Trần Thị B",
              phone: "0912345678",
            },
            averageRating: 4.2,
            reviewCount: 8,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-green-600">
              GreenConnect
            </Link>
            <nav className="flex space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-green-600"
              >
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-green-600 font-medium">
                Chợ nông sản
              </Link>
              <Link
                href="/orders"
                className="text-gray-700 hover:text-green-600"
              >
                Đơn hàng
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chợ nông sản tươi sống
          </h1>
          <p className="text-xl text-gray-600">
            Kết nối trực tiếp với nông dân, mua sắm nông sản tươi ngon
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={
                        product.images[0] ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        {product.price.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-sm text-gray-500">
                        /{product.unit}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {product.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {product.averageRating}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({product.reviewCount})
                        </span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Bởi {product.seller.fullName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    >
                      <QuickChatButton
                        userId={product.seller.id}
                        userName={product.seller.fullName}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
