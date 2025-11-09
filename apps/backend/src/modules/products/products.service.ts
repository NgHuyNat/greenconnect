import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, ILike } from "typeorm";
import { Product, ProductStatus } from "../../common/entities/product.entity";
import { User } from "../../common/entities/user.entity";
import { Review } from "../../common/entities/review.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PRODUCT_CATEGORIES } from "./dto/product-category.dto";

interface FindAllFilters {
  category?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Review) private reviewRepository: Repository<Review>
  ) {}

  async findAll(filters?: FindAllFilters) {
    const { category, location, search, page = 1, limit = 10 } = filters || {};

    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.seller", "seller");

    if (category) {
      queryBuilder.andWhere("product.category ILIKE :category", {
        category: `%${category}%`,
      });
    }

    if (location) {
      queryBuilder.andWhere("product.location ILIKE :location", {
        location: `%${location}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(product.name ILIKE :search OR product.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    const skip = (page - 1) * limit;

    queryBuilder.orderBy("product.createdAt", "DESC").skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    // Get reviews for rating calculation
    const productsWithRating = await Promise.all(
      products.map(async (product) => {
        const reviews = await this.reviewRepository.find({
          where: { product: { id: product.id } },
        });
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

        return {
          ...product,
          seller: product.seller,
          averageRating,
          reviewCount: reviews.length,
        };
      })
    );

    return {
      data: productsWithRating,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Get reviews with buyer info
    const reviews = await this.reviewRepository.find({
      where: { product: { id } },
      relations: ["buyer"],
      order: { createdAt: "DESC" },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return {
      ...product,
      seller: product.seller,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    };
  }

  async create(createProductDto: CreateProductDto, sellerId: string) {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new NotFoundException("Seller not found");
    }

    const productData = {
      ...createProductDto,
      seller,
      harvestDate: createProductDto.harvestDate
        ? new Date(createProductDto.harvestDate)
        : undefined,
    };

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    return this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ["seller"],
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.seller.id !== userId) {
      throw new ForbiddenException("You can only update your own products");
    }

    const updateData = {
      ...updateProductDto,
      harvestDate: updateProductDto.harvestDate
        ? new Date(updateProductDto.harvestDate)
        : undefined,
    };

    await this.productRepository.update(id, updateData);

    return this.productRepository.findOne({
      where: { id },
      relations: ["seller"],
    });
  }

  async delete(id: string, userId: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.seller.id !== userId) {
      throw new ForbiddenException("You can only delete your own products");
    }

    await this.productRepository.delete(id);
    return { message: "Product deleted successfully" };
  }

  async findBySeller(sellerId: string) {
    const products = await this.productRepository.find({
      where: { seller: { id: sellerId } },
      order: { createdAt: "DESC" },
    });

    // Calculate ratings for each product
    const productsWithRating = await Promise.all(
      products.map(async (product) => {
        const reviews = await this.reviewRepository.find({
          where: { product: { id: product.id } },
        });
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

        return {
          ...product,
          averageRating,
          reviewCount: reviews.length,
        };
      })
    );

    return productsWithRating;
  }

  async getCategories() {
    // Get categories from actual products in database
    const dbCategoriesResult = await this.productRepository
      .createQueryBuilder("product")
      .select("DISTINCT product.category", "category")
      .getRawMany();

    const dbCategories = dbCategoriesResult
      .map((row) => row.category)
      .filter(Boolean);

    // Combine predefined categories with database categories
    const allCategories = [
      ...PRODUCT_CATEGORIES,
      ...dbCategories
        .filter(
          (category) => !PRODUCT_CATEGORIES.find((pc) => pc.name === category)
        )
        .map((category) => ({
          name: category,
          icon: "📦",
          description: `Danh mục ${category}`,
        })),
    ];

    return {
      categories: allCategories,
      total: allCategories.length,
    };
  }

  async getFeaturedProducts(limit: number = 10) {
    return this.productRepository.find({
      where: {
        isPromoted: true,
        promotedUntil: new Date(),
        status: ProductStatus.AVAILABLE,
      },
      relations: ["seller"],
      order: {
        promotedUntil: "DESC",
        createdAt: "DESC",
      },
      take: limit,
    });
  }

  async getPopularProducts(limit: number = 10) {
    return this.productRepository.find({
      where: { status: ProductStatus.AVAILABLE },
      relations: ["seller"],
      order: {
        soldCount: "DESC",
        viewCount: "DESC",
        createdAt: "DESC",
      },
      take: limit,
    });
  }

  async incrementViewCount(id: string) {
    await this.productRepository.increment({ id }, "viewCount", 1);
    return this.productRepository.findOne({
      where: { id },
      select: ["id", "viewCount"],
    });
  }

  async promoteProduct(id: string, userId: string, days: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["seller"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.seller.id !== userId) {
      throw new ForbiddenException("You can only promote your own products");
    }

    const promotedUntil = new Date();
    promotedUntil.setDate(promotedUntil.getDate() + days);

    await this.productRepository.update(id, {
      isPromoted: true,
      promotedUntil,
    });

    return this.productRepository.findOne({
      where: { id },
      select: ["id", "name", "isPromoted", "promotedUntil"],
    });
  }

  async getSellerStatistics(sellerId: string) {
    const [
      totalProducts,
      availableProducts,
      totalOrders,
      totalRevenue,
      avgRatingResult,
      totalViewsResult,
    ] = await Promise.all([
      // Total products
      this.productRepository.count({ where: { seller: { id: sellerId } } }),

      // Available products
      this.productRepository.count({
        where: {
          seller: { id: sellerId },
          status: ProductStatus.AVAILABLE,
        },
      }),

      // Total orders - We'll implement this when Order model is ready
      0, // TODO: Implement when Order model is converted to TypeORM

      // Total revenue - We'll implement this when Order model is ready
      0, // TODO: Implement when Order model is converted to TypeORM

      // Average rating
      this.reviewRepository
        .createQueryBuilder("review")
        .leftJoin("review.product", "product")
        .leftJoin("product.seller", "seller")
        .select("AVG(review.rating)", "avgRating")
        .where("seller.id = :sellerId", { sellerId })
        .getRawOne(),

      // Total views
      this.productRepository
        .createQueryBuilder("product")
        .select("SUM(product.viewCount)", "totalViews")
        .where("product.seller.id = :sellerId", { sellerId })
        .getRawOne(),
    ]);

    // Recent orders - TODO: Implement when Order model is ready
    const recentOrders = [];

    // Top products
    const topProducts = await this.productRepository.find({
      where: { seller: { id: sellerId } },
      order: {
        soldCount: "DESC",
        viewCount: "DESC",
      },
      take: 5,
    });

    return {
      overview: {
        totalProducts,
        availableProducts,
        soldOutProducts: totalProducts - availableProducts,
        totalOrders,
        totalRevenue,
        averageRating: avgRatingResult?.avgRating
          ? parseFloat(avgRatingResult.avgRating)
          : 0,
        totalViews: totalViewsResult?.totalViews
          ? parseInt(totalViewsResult.totalViews)
          : 0,
      },
      recentOrders,
      topProducts,
    };
  }
}
