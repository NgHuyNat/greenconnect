import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum DonationStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum DonationType {
  FOOD_WASTE_REDUCTION = "FOOD_WASTE_REDUCTION",
  SUSTAINABLE_FARMING = "SUSTAINABLE_FARMING",
  ORGANIC_CERTIFICATION = "ORGANIC_CERTIFICATION",
  COMMUNITY_GARDEN = "COMMUNITY_GARDEN",
  RESEARCH_DEVELOPMENT = "RESEARCH_DEVELOPMENT",
  OTHER = "OTHER",
}

@Entity("donations")
export class Donation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: DonationType,
    default: DonationType.FOOD_WASTE_REDUCTION,
  })
  type: DonationType;

  @Column({
    type: "enum",
    enum: DonationStatus,
    default: DonationStatus.PENDING,
  })
  status: DonationStatus;

  @Column({ nullable: true })
  message?: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.donations)
  @JoinColumn({ name: "donorId" })
  donor: User;
}
