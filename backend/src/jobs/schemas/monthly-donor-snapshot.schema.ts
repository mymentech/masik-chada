import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type MonthlyDonorSnapshotDocument = HydratedDocument<MonthlyDonorSnapshot>;

@ObjectType()
@Schema({
  collection: 'monthly_donor_snapshots',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class MonthlyDonorSnapshot {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Donor', required: true, index: true })
  donor_id!: Types.ObjectId;

  @Field()
  @Prop({ required: true, index: true })
  month_key!: string;

  @Field(() => Float)
  @Prop({ required: true })
  total_due!: number;

  @Field(() => Float)
  @Prop({ required: true })
  total_paid!: number;

  @Field(() => Float)
  @Prop({ required: true })
  balance!: number;

  @Field()
  @Prop({ type: Date, required: true })
  computed_at!: Date;

  @Field({ nullable: true })
  @Prop({ type: Date, default: Date.now })
  created_at?: Date;

  @Field({ nullable: true })
  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const MonthlyDonorSnapshotSchema = SchemaFactory.createForClass(MonthlyDonorSnapshot);
MonthlyDonorSnapshotSchema.index({ donor_id: 1, month_key: 1 }, { unique: true });
