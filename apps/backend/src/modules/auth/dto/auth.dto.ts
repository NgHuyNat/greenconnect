import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum Role {
  BUYER = "BUYER",
  SELLER = "SELLER",
  BOTH = "BOTH",
}

export class RegisterDto {
  @ApiProperty({ example: "john_doe", description: "Username" })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address",
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+84901234567", description: "Phone number" })
  @IsOptional()
  @IsPhoneNumber("VN")
  phone?: string;

  @ApiProperty({ example: "password123", description: "Password" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "Nguyen Van A", description: "Full name" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({
    example: "123 Nguyen Trai, District 1, Ho Chi Minh City",
    description: "Address",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 10.762622,
    description: "Latitude coordinate",
  })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    example: 106.660172,
    description: "Longitude coordinate",
  })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    example: "Cooperativa Agricola ABC",
    description: "Organization name",
  })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.BOTH,
    description: "User role",
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class LoginDto {
  @ApiProperty({
    example: "john_doe",
    description: "Username, email or phone number",
  })
  @IsString()
  identifier: string; // username, email, or phone

  @ApiProperty({ example: "password123", description: "Password" })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: "JWT access token" })
  access_token: string;

  @ApiProperty({ description: "User information" })
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: Role;
    avatar?: string;
  };
}
