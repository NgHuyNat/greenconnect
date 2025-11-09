import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DonationsController } from "./donations.controller";
import { DonationsService } from "./donations.service";
import { Donation } from "../../common/entities/donation.entity";
import { User } from "../../common/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Donation, User])],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
