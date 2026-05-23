import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting) private readonly repo: Repository<AppSetting>,
  ) {}

  async get(): Promise<AppSetting> {
    let row = await this.repo.findOne({ where: { id: 1 } });
    if (!row) {
      row = await this.repo.save(
        this.repo.create({ id: 1, allow_donor_delete: false, allow_payment_delete: false }),
      );
    }
    return row;
  }

  async update(
    patch: Partial<Pick<AppSetting, 'allow_donor_delete' | 'allow_payment_delete'>>,
  ): Promise<AppSetting> {
    await this.get();
    if (Object.keys(patch).length > 0) {
      await this.repo.update({ id: 1 }, patch);
    }
    return (await this.repo.findOne({ where: { id: 1 } }))!;
  }
}
