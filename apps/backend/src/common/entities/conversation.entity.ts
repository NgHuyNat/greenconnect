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
import { Message } from "./message.entity";

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.conversationsAsParticipant1)
  @JoinColumn({ name: "participant1Id" })
  participant1: User;

  @Column()
  participant1Id: string;

  @ManyToOne(() => User, (user) => user.conversationsAsParticipant2)
  @JoinColumn({ name: "participant2Id" })
  participant2: User;

  @Column()
  participant2Id: string;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];
}
