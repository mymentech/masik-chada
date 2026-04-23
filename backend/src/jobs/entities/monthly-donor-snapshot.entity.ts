import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@ObjectType()
@Entity('monthly_donor_snapshots')
export class MonthlyDonorSnapshot {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => ID)
  @Column({ type: 'bigint', name: 'donor_id' })
  donor_id!: number;

  @Field()
  @Column({ length: 7, name: 'month_key' })
  month_key!: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_due', transformer: decimalTransformer })
  total_due!: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_paid', transformer: decimalTransformer })
  total_paid!: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  balance!: number;

  @Field()
  @Column({ type: 'timestamptz', name: 'computed_at' })
  computed_at!: Date;

  @Field({ nullable: true })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;

  @Field({ nullable: true })
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at!: Date;
}
