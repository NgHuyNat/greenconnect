import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiQuery({
    name: "category",
    required: false,
    description: "Filter by category",
  })
  @ApiQuery({
    name: "location",
    required: false,
    description: "Filter by location",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search in product name and description",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Items per page",
    type: Number,
  })
  async findAll(
    @Query("category") category?: string,
    @Query("location") location?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.productsService.findAll({
      category,
      location,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({ status: 200, description: "Product found" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findById(@Param("id") id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: any
  ) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - not product owner" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: any
  ) {
    return this.productsService.update(id, updateProductDto, user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete product" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - not product owner" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async delete(@Param("id") id: string, @GetUser() user: any) {
    return this.productsService.delete(id, user.id);
  }

  @Get("seller/:sellerId")
  @ApiOperation({ summary: "Get products by seller ID" })
  @ApiResponse({ status: 200, description: "Products found" })
  async findBySeller(@Param("sellerId") sellerId: string) {
    return this.productsService.findBySeller(sellerId);
  }

  @Get("categories/list")
  @ApiOperation({ summary: "Get all product categories" })
  @ApiResponse({ status: 200, description: "Categories list" })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get("featured/promoted")
  @ApiOperation({ summary: "Get promoted/featured products" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getFeaturedProducts(@Query("limit") limit?: string) {
    return this.productsService.getFeaturedProducts(
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Get("popular/trending")
  @ApiOperation({
    summary: "Get popular/trending products based on views and sales",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getPopularProducts(@Query("limit") limit?: string) {
    return this.productsService.getPopularProducts(
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Post(":id/view")
  @ApiOperation({ summary: "Increment product view count" })
  async incrementView(@Param("id") id: string) {
    return this.productsService.incrementViewCount(id);
  }

  @Put(":id/promote")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Promote product (seller only)" })
  async promoteProduct(
    @Param("id") id: string,
    @GetUser() user: any,
    @Body() body: { days: number }
  ) {
    return this.productsService.promoteProduct(id, user.id, body.days);
  }

  @Get("statistics/dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get seller dashboard statistics" })
  async getSellerStatistics(@GetUser() user: any) {
    return this.productsService.getSellerStatistics(user.id);
  }
}
