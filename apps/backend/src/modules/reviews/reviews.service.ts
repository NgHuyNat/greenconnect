import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "../../common/entities/review.entity";
import { Product } from "../../common/entities/product.entity";
import { User } from "../../common/entities/user.entity";

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
      relations: ["seller"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Check if user is trying to review their own product
    if (product.seller.id === reviewerId) {
      throw new BadRequestException("Cannot review your own product");
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: {
        product: { id: createReviewDto.productId },
        reviewer: { id: reviewerId },
      },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this product");
    }

    // Validate rating
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    const reviewer = await this.userRepository.findOne({
      where: { id: reviewerId },
    });

    const review = this.reviewRepository.create({
      ...createReviewDto,
      product,
      reviewer,
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ["reviewer"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string) {
    return this.reviewRepository.find({
      where: { reviewer: { id: userId } },
      relations: ["product"],
      order: { createdAt: "DESC" },
    });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ["reviewer"],
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.reviewer.id !== userId) {
      throw new ForbiddenException("You can only update your own reviews");
    }

    // Validate rating if provided
    if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    await this.reviewRepository.update(id, updateReviewDto);

    return this.reviewRepository.findOne({
      where: { id },
      relations: ["reviewer", "product"],
    });
  }

  async delete(id: string, userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ["reviewer"],
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.reviewer.id !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.reviewRepository.delete(id);
    return { message: "Review deleted successfully" };
  }

  async getProductRatingStats(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }
}
