import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./common/database/database.module";
import { FirebaseModule } from "./common/firebase/firebase.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
// import { OrdersModule } from "./modules/orders/orders.module"; // TODO: Convert to TypeORM
import { ChatModule } from "./modules/chat/chat.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { UploadModule } from "./modules/upload/upload.module";
import { DonationsModule } from "./modules/donations/donations.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // limit each IP to 10 requests per ttl
      },
    ]),
    DatabaseModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    // OrdersModule, // TODO: Convert to TypeORM
    ChatModule,
    ReviewsModule,
    UploadModule,
    DonationsModule,
  ],
})
export class AppModule {}
