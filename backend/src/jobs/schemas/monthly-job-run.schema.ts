import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MonthlyJobRunDocument = HydratedDocument<MonthlyJobRun>;

@ObjectType()
@Schema({
  collection: 'monthly_job_runs',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class MonthlyJobRun {
  @Field(() => ID)
  id!: string;

  @Field()
  @Prop({ required: true, index: true })
  job_key!: string;

  @Field()
  @Prop({ required: true, index: true })
  month_key!: string;

  @Field(() => Int)
  @Prop({ required: true })
  total_donors_scanned!: number;

  @Field(() => Int)
  @Prop({ required: true })
  successful_writes!: number;

  @Field(() => Int)
  @Prop({ required: true })
  failed_donors!: number;

  @Field(() => Int)
  @Prop({ required: true })
  duration_ms!: number;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  failed_donor_ids!: string[];

  @Field()
  @Prop({ type: Date, required: true })
  started_at!: Date;

  @Field()
  @Prop({ type: Date, required: true })
  finished_at!: Date;

  @Field()
  @Prop({ type: Date, default: Date.now })
  created_at!: Date;
}

export const MonthlyJobRunSchema = SchemaFactory.createForClass(MonthlyJobRun);
MonthlyJobRunSchema.index({ job_key: 1, month_key: 1 }, { unique: true });
