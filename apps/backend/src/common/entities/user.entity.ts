import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Product } from "./product.entity";
import { Order } from "./order.entity";
import { Review } from "./review.entity";
import { Conversation } from "./conversation.entity";
import { Message } from "./message.entity";
import { Donation } from "./donation.entity";

export enum Role {
  BUYER = "BUYER",
  SELLER = "SELLER",
  BOTH = "BOTH",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  organization?: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.BUYER,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];

  @OneToMany(() => Conversation, (conversation) => conversation.participant1)
  conversationsAsParticipant1: Conversation[];

  @OneToMany(() => Conversation, (conversation) => conversation.participant2)
  conversationsAsParticipant2: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Donation, (donation) => donation.donor)
  donations: Donation[];
}
