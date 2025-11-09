import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: "Rau củ quả", description: "Category name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Các loại rau củ quả tươi",
    description: "Category description",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "🥬", description: "Category icon/emoji" })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class ProductCategoriesResponseDto {
  @ApiProperty({
    example: ["Rau củ quả", "Trái cây", "Ngũ cốc", "Thịt cá"],
    description: "Available categories",
  })
  categories: string[];

  @ApiProperty({ example: 150, description: "Total number of categories" })
  total: number;
}

export const PRODUCT_CATEGORIES = [
  {
    name: "Rau củ quả",
    icon: "🥬",
    description: "Các loại rau xanh, củ quả tươi",
  },
  { name: "Trái cây", icon: "🍎", description: "Trái cây tươi các loại" },
  {
    name: "Ngũ cốc",
    icon: "🌾",
    description: "Gạo, lúa mì, ngô và các loại ngũ cốc",
  },
  {
    name: "Thịt cá",
    icon: "🐟",
    description: "Thịt gia súc, gia cầm và thủy sản",
  },
  { name: "Gia vị", icon: "🌶️", description: "Gia vị, rau thơm" },
  {
    name: "Sản phẩm chế biến",
    icon: "🥫",
    description: "Thực phẩm đã qua chế biến",
  },
  { name: "Sữa và trứng", icon: "🥛", description: "Sản phẩm từ sữa và trứng" },
  {
    name: "Mật ong",
    icon: "🍯",
    description: "Mật ong và sản phẩm từ mật ong",
  },
  {
    name: "Thực phẩm hữu cơ",
    icon: "🌿",
    description: "Sản phẩm hữu cơ, sạch",
  },
  { name: "Khác", icon: "📦", description: "Các sản phẩm khác" },
];
