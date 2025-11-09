import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search users" })
  @ApiResponse({ status: 200, description: "Users list retrieved" })
  async searchUsers(
    @Query("search") search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ): Promise<any> {
    const users = await this.usersService.searchUsers({
      search,
      limit: limit ? parseInt(limit.toString()) : 20,
      page: page ? parseInt(page.toString()) : 1,
    });

    // Return only public information
    return {
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  async getCurrentProfile(@Request() req): Promise<any> {
    const { password, ...userWithoutPassword } =
      await this.usersService.findById(req.user.id);
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@Request() req, @Body() updateData: any): Promise<any> {
    const { password, ...userWithoutPassword } =
      await this.usersService.updateProfile(req.user.id, updateData);
    return userWithoutPassword;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID (public profile)" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  async getUserById(@Param("id") id: string): Promise<any> {
    const user = await this.usersService.findById(id);
    // Return only public information
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      // TODO: Add rating calculation from reviews when Reviews module is implemented
      rating: 0,
      totalRatings: 0,
    };
  }
}
