import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  IsDateString,
} from "class-validator";

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  SOLD_OUT = "SOLD_OUT",
  DISCONTINUED = "DISCONTINUED",
}

export class CreateProductDto {
  @ApiProperty({ description: "Product name", example: "Organic Tomatoes" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Product description",
    example: "Fresh organic tomatoes from local farm",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Product price per unit", example: 25000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: "Product quantity available", example: 100 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: "Product category", example: "Vegetables" })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: "Product unit (kg, piece, etc.)", example: "kg" })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    description: "Product images",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: "Product location", example: "Ho Chi Minh City" })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: "Harvest date",
    example: "2024-01-15T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsString()
  harvestDate?: string;

  @ApiPropertyOptional({
    description: "Product status",
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: "Minimum order quantity",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional({
    description: "Maximum order quantity per customer",
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOrderQuantity?: number;

  @ApiPropertyOptional({
    description: "Product tags for search",
    example: ["organic", "fresh", "local"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Is product organic certified",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @ApiPropertyOptional({
    description: "Special discount percentage (0-100)",
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: "Product weight in kg",
    example: 0.5,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;

  @ApiPropertyOptional({
    description: "Storage instructions",
    example: "Store in cool, dry place",
  })
  @IsOptional()
  @IsString()
  storageInstructions?: string;

  @ApiPropertyOptional({
    description: "Nutritional information",
    example: "Rich in Vitamin C and fiber",
  })
  @IsOptional()
  @IsString()
  nutritionalInfo?: string;
}
