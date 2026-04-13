import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DonorDocument = HydratedDocument<Donor>;

@ObjectType()
@Schema({
  collection: 'donors',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Donor {
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  @Prop({ required: true, unique: true, index: true })
  serial_number!: number;

  @Field()
  @Prop({ required: true, trim: true })
  name!: string;

  @Field({ nullable: true })
  @Prop({ default: '+880' })
  phone!: string;

  @Field()
  @Prop({ required: true, trim: true, index: true })
  address!: string;

  @Field(() => Float)
  @Prop({ required: true })
  monthly_amount!: number;

  @Field()
  @Prop({ required: true, type: Date })
  registration_date!: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  due_from!: Date | null;

  @Field()
  @Prop({ type: Date, default: Date.now })
  created_at!: Date;

  @Field()
  @Prop({ type: Date, default: Date.now })
  updated_at!: Date;
}

export const DonorSchema = SchemaFactory.createForClass(Donor);
