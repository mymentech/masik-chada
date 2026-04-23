import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@ObjectType()
@Entity('payments')
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => ID)
  @Column({ type: 'bigint', name: 'donor_id' })
  donor_id!: number;

  @Field(() => ID)
  @Column({ type: 'bigint', name: 'collector_id' })
  collector_id!: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  amount!: number;

  @Field()
  @Column({ type: 'timestamptz', name: 'payment_date' })
  payment_date!: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
