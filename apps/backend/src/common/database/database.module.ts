import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Review } from "../entities/review.entity";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { Donation } from "../entities/donation.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5433),
        username: configService.get<string>("DB_USERNAME", "postgres"),
        password: configService.get<string>("DB_PASSWORD", "postgres123"),
        database: configService.get<string>("DB_NAME", "greenconnect"),
        entities: [
          User,
          Product,
          Order,
          OrderItem,
          Review,
          Conversation,
          Message,
          Donation,
        ],
        synchronize: configService.get<boolean>("DB_SYNC", true),
        logging: configService.get<boolean>("DB_LOGGING", true),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
