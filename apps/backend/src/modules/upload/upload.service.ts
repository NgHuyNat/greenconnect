import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../../common/firebase/firebase.service";

@Injectable()
export class UploadService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async uploadSingle(
    file: Express.Multer.File,
    folder: string = "products"
  ): Promise<string> {
    return this.firebaseService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = "products"
  ): Promise<string[]> {
    const fileData = files.map((file) => ({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
    }));

    return this.firebaseService.uploadMultipleFiles(fileData, folder);
  }

  async deleteFile(url: string): Promise<void> {
    return this.firebaseService.deleteFile(url);
  }
}
