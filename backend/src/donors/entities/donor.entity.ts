import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@ObjectType()
@Entity('donors')
export class Donor {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ type: 'int', unique: true })
  serial_number!: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, default: '+880' })
  phone!: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  monthly_amount!: number;

  @Field()
  @Column({ type: 'timestamptz', name: 'registration_date' })
  registration_date!: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', name: 'due_from', nullable: true, default: null })
  due_from!: Date | null;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at!: Date;
}
