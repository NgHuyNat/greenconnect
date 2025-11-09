import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import { Review } from "./review.entity";

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  SOLD_OUT = "SOLD_OUT",
  DISCONTINUED = "DISCONTINUED",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("text")
  description: string;

  @Column()
  category: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column()
  unit: string;

  @Column("text", { array: true, default: [] })
  images: string[];

  @Column()
  location: string;

  @Column({ nullable: true })
  harvestDate?: Date;

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  status: ProductStatus;

  @Column({ default: 1 })
  minOrderQuantity: number;

  @Column({ nullable: true })
  maxOrderQuantity?: number;

  @Column("text", { array: true, default: [] })
  tags: string[];

  @Column({ default: false })
  isOrganic: boolean;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column("decimal", { precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Column({ nullable: true })
  storageInstructions?: string;

  @Column({ nullable: true })
  nutritionalInfo?: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  soldCount: number;

  @Column({ default: false })
  isPromoted: boolean;

  @Column({ nullable: true })
  promotedUntil?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: "sellerId" })
  seller: User;

  @Column()
  sellerId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
