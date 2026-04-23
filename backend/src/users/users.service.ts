import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

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
}
