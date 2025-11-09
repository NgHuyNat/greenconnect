import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Delete,
  Body,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Upload")
@Controller("upload")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("single")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload single image" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "File uploaded successfully" })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ url: string }> {
    const url = await this.uploadService.uploadSingle(file);
    return { url };
  }

  @Post("multiple")
  @UseInterceptors(FilesInterceptor("files", 10)) // Max 10 files
  @ApiOperation({ summary: "Upload multiple images" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Files uploaded successfully" })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<{ urls: string[] }> {
    const urls = await this.uploadService.uploadMultiple(files);
    return { urls };
  }

  @Delete()
  @ApiOperation({ summary: "Delete uploaded file" })
  @ApiResponse({ status: 200, description: "File deleted successfully" })
  async deleteFile(
    @Body() body: { url: string }
  ): Promise<{ message: string }> {
    await this.uploadService.deleteFile(body.url);
    return { message: "File deleted successfully" };
  }
}
