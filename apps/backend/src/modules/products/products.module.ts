import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product } from "../../common/entities/product.entity";
import { User } from "../../common/entities/user.entity";
import { Review } from "../../common/entities/review.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Review])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
