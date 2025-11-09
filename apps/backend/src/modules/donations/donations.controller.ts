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
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import {
  DonationsService,
  CreateDonationDto,
  UpdateDonationDto,
} from "./donations.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Donations")
@Controller("donations")
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new donation" })
  @ApiResponse({ status: 201, description: "Donation created successfully" })
  async create(@Body() createDonationDto: CreateDonationDto, @Request() req) {
    return this.donationsService.create(createDonationDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all donations (public)" })
  @ApiResponse({ status: 200, description: "Donations retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.donationsService.findAll(parseInt(page), parseInt(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-donations")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's donations" })
  @ApiResponse({
    status: 200,
    description: "User donations retrieved successfully",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getMyDonations(
    @Request() req,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.donationsService.findByUser(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get donation statistics" })
  @ApiResponse({
    status: 200,
    description: "Donation statistics retrieved successfully",
  })
  async getStats() {
    return this.donationsService.getStats();
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent donations" })
  @ApiResponse({
    status: 200,
    description: "Recent donations retrieved successfully",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRecentDonations(@Query("limit") limit: string = "10") {
    return this.donationsService.getRecentDonations(parseInt(limit));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get donation by ID" })
  @ApiResponse({ status: 200, description: "Donation retrieved successfully" })
  async findById(@Param("id") id: string, @Request() req) {
    const userId = req.user?.id; // Optional auth for public viewing
    return this.donationsService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update donation (admin only)" })
  @ApiResponse({ status: 200, description: "Donation updated successfully" })
  async update(
    @Param("id") id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationsService.update(id, updateDonationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/cancel")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel a pending donation" })
  @ApiResponse({ status: 200, description: "Donation cancelled successfully" })
  async cancel(@Param("id") id: string, @Request() req) {
    return this.donationsService.cancel(id, req.user.id);
  }
}
