import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ReviewsService, CreateReviewDto, UpdateReviewDto } from "./reviews.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new review" })
  @ApiResponse({ status: 201, description: "Review created successfully" })
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get reviews for a product" })
  @ApiResponse({ status: 200, description: "Reviews retrieved successfully" })
  async getProductReviews(@Param("productId") productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get("product/:productId/stats")
  @ApiOperation({ summary: "Get rating statistics for a product" })
  @ApiResponse({ status: 200, description: "Rating stats retrieved successfully" })
  async getProductRatingStats(@Param("productId") productId: string) {
    return this.reviewsService.getProductRatingStats(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-reviews")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's reviews" })
  @ApiResponse({ status: 200, description: "User reviews retrieved successfully" })
  async getMyReviews(@Request() req) {
    return this.reviewsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a review" })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  async update(
    @Param("id") id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  async delete(@Param("id") id: string, @Request() req) {
    return this.reviewsService.delete(id, req.user.id);
  }
}
