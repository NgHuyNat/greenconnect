import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private storage: admin.storage.Storage;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID");
      const privateKey = this.configService
        .get<string>("FIREBASE_PRIVATE_KEY")
        ?.replace(/\\n/g, "\n");
      const clientEmail = this.configService.get<string>(
        "FIREBASE_CLIENT_EMAIL"
      );

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn(
          "Firebase configuration not found. File upload will be disabled."
        );
        return;
      }

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
          storageBucket: this.configService.get<string>(
            "FIREBASE_STORAGE_BUCKET"
          ),
        });
      }

      this.storage = admin.storage();
      this.logger.log("Firebase initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Firebase:", error);
    }
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string = "uploads"
  ): Promise<string> {
    if (!this.storage) {
      throw new Error("Firebase storage not initialized");
    }

    const bucket = this.storage.bucket();
    const file = bucket.file(`${folder}/${Date.now()}-${filename}`);

    const stream = file.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        this.logger.error("Upload error:", error);
        reject(error);
      });

      stream.on("finish", async () => {
        try {
          // Make the file public
          await file.makePublic();

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
          resolve(publicUrl);
        } catch (error) {
          this.logger.error("Failed to make file public:", error);
          reject(error);
        }
      });

      stream.end(buffer);
    });
  }

  async deleteFile(url: string): Promise<void> {
    if (!this.storage) {
      throw new Error("Firebase storage not initialized");
    }

    try {
      // Extract file path from URL
      const urlParts = url.split("/");
      const bucketName = urlParts[3];
      const filePath = urlParts.slice(4).join("/");

      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(filePath);

      await file.delete();
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error("Failed to delete file:", error);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; filename: string; mimetype: string }>,
    folder: string = "uploads"
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.filename, file.mimetype, folder)
    );

    return Promise.all(uploadPromises);
  }
}
