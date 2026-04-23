import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import {
  AdminUpdateUserInput,
  ChangePasswordInput,
  CreateUserInput,
  UpdateProfileInput,
} from './dto/user.inputs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  findByEmail(email: string) {
    return this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: email.toLowerCase().trim() })
      .getOne();
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id: Number(id) as unknown as number } });
  }

  async list(): Promise<User[]> {
    return this.userRepo.createQueryBuilder('u').orderBy('u.id', 'ASC').getMany();
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase().trim();
    if (!email) throw new BadRequestException('Email is required');
    if (!input.name?.trim()) throw new BadRequestException('Name is required');
    if (!input.password || input.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(input.password, 12);
    const user = this.userRepo.create({
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || '+880',
      role: input.role || UserRole.Collector,
      password: hashed,
    });
    return this.userRepo.save(user);
  }

  async adminUpdateUser(id: string, input: AdminUpdateUserInput): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) throw new NotFoundException('User not found');

    const patch: Partial<User> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.phone !== undefined) patch.phone = input.phone.trim() || '+880';
    if (input.role !== undefined) patch.role = input.role;
    if (input.email !== undefined) {
      const email = input.email.toLowerCase().trim();
      if (email !== user.email) {
        const taken = await this.userRepo.findOne({ where: { email, id: Not(user.id) } });
        if (taken) throw new BadRequestException('Email already in use');
      }
      patch.email = email;
    }

    await this.userRepo.update(user.id, patch);
    return (await this.userRepo.findOne({ where: { id: user.id } }))!;
  }

  async deleteUser(id: string, actingUserId: string): Promise<boolean> {
    if (String(id) === String(actingUserId)) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.delete(user.id);
    return true;
  }

  async adminResetPassword(id: string, newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) throw new NotFoundException('User not found');
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(user.id, { password: hashed });
    return true;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException('User not found');

    const patch: Partial<User> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.phone !== undefined) patch.phone = input.phone.trim() || '+880';
    if (input.email !== undefined) {
      const email = input.email.toLowerCase().trim();
      if (email !== user.email) {
        const taken = await this.userRepo.findOne({ where: { email, id: Not(user.id) } });
        if (taken) throw new BadRequestException('Email already in use');
      }
      patch.email = email;
    }

    await this.userRepo.update(user.id, patch);
    return (await this.userRepo.findOne({ where: { id: user.id } }))!;
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<boolean> {
    if (!input.newPassword || input.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.id = :id', { id: Number(userId) })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    const ok = await bcrypt.compare(input.currentPassword || '', user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    const hashed = await bcrypt.hash(input.newPassword, 12);
    await this.userRepo.update(user.id, { password: hashed });
    return true;
  }

  async setPasswordDirectly(userId: number, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { password: hashed });
  }
}
