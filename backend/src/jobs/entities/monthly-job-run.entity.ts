import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('monthly_job_runs')
export class MonthlyJobRun {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field()
  @Column({ length: 255, name: 'job_key' })
  job_key!: string;

  @Field()
  @Column({ length: 7, name: 'month_key' })
  month_key!: string;

  @Field(() => Int)
  @Column({ name: 'total_donors_scanned', default: 0 })
  total_donors_scanned!: number;

  @Field(() => Int)
  @Column({ name: 'successful_writes', default: 0 })
  successful_writes!: number;

  @Field(() => Int)
  @Column({ name: 'failed_donors', default: 0 })
  failed_donors!: number;

  @Field(() => Int)
  @Column({ name: 'duration_ms', default: 0 })
  duration_ms!: number;

  @Field(() => [String])
  @Column({ type: 'text', array: true, name: 'failed_donor_ids', default: '{}' })
  failed_donor_ids!: string[];

  @Field()
  @Column({ type: 'timestamptz', name: 'started_at' })
  started_at!: Date;

  @Field()
  @Column({ type: 'timestamptz', name: 'finished_at' })
  finished_at!: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
