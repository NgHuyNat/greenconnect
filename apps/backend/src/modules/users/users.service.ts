import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../common/entities/user.entity";
import { RegisterDto, Role } from "../auth/dto/auth.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByIdentifier(createUserDto.username);
    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException("Email already exists");
    }

    if (createUserDto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: createUserDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException("Phone number already exists");
      }
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(id: string, updateData: any): Promise<User> {
    const result = await this.userRepository.update(id, updateData);

    if (result.affected === 0) {
      throw new NotFoundException("User not found");
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async searchUsers(params: {
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<User[]> {
    const { search, limit = 20, page = 1 } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (search) {
      queryBuilder.where(
        "(user.fullName LIKE :search OR user.email LIKE :search OR user.username LIKE :search)",
        { search: `%${search}%` }
      );
    }

    queryBuilder.take(limit).skip(skip).orderBy("user.createdAt", "DESC");

    return queryBuilder.getMany();
  }
}
