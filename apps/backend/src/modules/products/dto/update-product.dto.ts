import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  IsEnum,
} from "class-validator";

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  SOLD_OUT = "SOLD_OUT",
  DISCONTINUED = "DISCONTINUED",
}

export class UpdateProductDto {
  @ApiProperty({
    description: "Product name",
    example: "Organic Tomatoes",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: "Product description",
    example: "Fresh organic tomatoes from local farm",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    description: "Product price per unit",
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty({
    description: "Product quantity available",
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @ApiProperty({
    description: "Product category",
    example: "Vegetables",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ApiProperty({
    description: "Product unit (kg, piece, etc.)",
    example: "kg",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @ApiProperty({
    description: "Product images",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: "Product location",
    example: "Ho Chi Minh City",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiProperty({
    description: "Harvest date",
    example: "2024-01-15T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsString()
  harvestDate?: string;

  @ApiProperty({
    description: "Product status",
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
