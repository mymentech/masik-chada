import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@ObjectType('AppSettings')
@Entity('app_settings')
export class AppSetting {
  @PrimaryColumn({ type: 'int', default: 1 })
  id!: number;

  @Field()
  @Column({ type: 'boolean', name: 'allow_donor_delete', default: false })
  allow_donor_delete!: boolean;

  @Field()
  @Column({ type: 'boolean', name: 'allow_payment_delete', default: false })
  allow_payment_delete!: boolean;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at!: Date;
}
