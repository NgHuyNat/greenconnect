import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Donation,
  DonationStatus,
  DonationType,
} from "../../common/entities/donation.entity";
import { User } from "../../common/entities/user.entity";

export interface CreateDonationDto {
  amount: number;
  type: DonationType;
  message?: string;
  isAnonymous?: boolean;
  paymentMethod?: string;
}

export interface UpdateDonationDto {
  status?: DonationStatus;
  transactionId?: string;
  message?: string;
}

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDonationDto: CreateDonationDto, donorId: string) {
    // Validate amount
    if (createDonationDto.amount <= 0) {
      throw new BadRequestException("Donation amount must be greater than 0");
    }

    const donor = await this.userRepository.findOne({
      where: { id: donorId },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    const donation = this.donationRepository.create({
      ...createDonationDto,
      donor,
      status: DonationStatus.PENDING,
    });

    return this.donationRepository.save(donation);
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [donations, total] = await this.donationRepository.findAndCount({
      relations: ["donor"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    // Hide donor info if anonymous
    const processedDonations = donations.map((donation) => ({
      ...donation,
      donor: donation.isAnonymous
        ? { id: "anonymous", fullName: "Anonymous Donor" }
        : {
            id: donation.donor.id,
            fullName: donation.donor.fullName,
            avatar: donation.donor.avatar,
          },
    }));

    return {
      donations: processedDonations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [donations, total] = await this.donationRepository.findAndCount({
      where: { donor: { id: userId } },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId?: string) {
    const donation = await this.donationRepository.findOne({
      where: { id },
      relations: ["donor"],
    });

    if (!donation) {
      throw new NotFoundException("Donation not found");
    }

    // Hide donor info if anonymous and user is not the donor
    if (donation.isAnonymous && donation.donor.id !== userId) {
      donation.donor = {
        id: "anonymous",
        fullName: "Anonymous Donor",
      } as any;
    }

    return donation;
  }

  async update(id: string, updateDonationDto: UpdateDonationDto) {
    const donation = await this.donationRepository.findOne({
      where: { id },
    });

    if (!donation) {
      throw new NotFoundException("Donation not found");
    }

    await this.donationRepository.update(id, updateDonationDto);

    return this.donationRepository.findOne({
      where: { id },
      relations: ["donor"],
    });
  }

  async cancel(id: string, userId: string) {
    const donation = await this.donationRepository.findOne({
      where: { id },
      relations: ["donor"],
    });

    if (!donation) {
      throw new NotFoundException("Donation not found");
    }

    if (donation.donor.id !== userId) {
      throw new BadRequestException("You can only cancel your own donations");
    }

    if (donation.status !== DonationStatus.PENDING) {
      throw new BadRequestException("Only pending donations can be cancelled");
    }

    await this.donationRepository.update(id, {
      status: DonationStatus.CANCELLED,
    });

    return { message: "Donation cancelled successfully" };
  }

  async getStats() {
    const [totalDonations, totalAmount, donationsByType, donationsByStatus] =
      await Promise.all([
        // Total donations count
        this.donationRepository.count(),

        // Total amount
        this.donationRepository
          .createQueryBuilder("donation")
          .select("SUM(donation.amount)", "total")
          .where("donation.status = :status", {
            status: DonationStatus.COMPLETED,
          })
          .getRawOne(),

        // Donations by type
        this.donationRepository
          .createQueryBuilder("donation")
          .select("donation.type", "type")
          .addSelect("COUNT(*)", "count")
          .addSelect("SUM(donation.amount)", "amount")
          .where("donation.status = :status", {
            status: DonationStatus.COMPLETED,
          })
          .groupBy("donation.type")
          .getRawMany(),

        // Donations by status
        this.donationRepository
          .createQueryBuilder("donation")
          .select("donation.status", "status")
          .addSelect("COUNT(*)", "count")
          .groupBy("donation.status")
          .getRawMany(),
      ]);

    return {
      totalDonations,
      totalAmount: parseFloat(totalAmount?.total || "0"),
      donationsByType: donationsByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
        amount: parseFloat(item.amount || "0"),
      })),
      donationsByStatus: donationsByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
    };
  }

  async getRecentDonations(limit = 10) {
    const donations = await this.donationRepository.find({
      relations: ["donor"],
      order: { createdAt: "DESC" },
      take: limit,
    });

    return donations.map((donation) => ({
      ...donation,
      donor: donation.isAnonymous
        ? { id: "anonymous", fullName: "Anonymous Donor" }
        : {
            id: donation.donor.id,
            fullName: donation.donor.fullName,
            avatar: donation.donor.avatar,
          },
    }));
  }
}
