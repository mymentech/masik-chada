import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@ObjectType()
@Schema({ collection: 'payments', timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Payment {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Donor', required: true, index: true })
  donor_id!: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
  collector_id!: Types.ObjectId;

  @Field(() => Float)
  @Prop({ required: true })
  amount!: number;

  @Field()
  @Prop({ type: Date, required: true, index: true })
  payment_date!: Date;

  @Field()
  @Prop({ type: Date, default: Date.now })
  created_at!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
