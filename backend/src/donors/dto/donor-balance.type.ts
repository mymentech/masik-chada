import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DonorBalance {
  @Field()
  id!: string;

  @Field(() => Int)
  serial_number!: number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  address!: string;

  @Field(() => Float)
  monthly_amount!: number;

  @Field()
  registration_date!: string;

  @Field({ nullable: true })
  due_from?: string;

  @Field(() => Float)
  total_due!: number;

  @Field(() => Float)
  total_paid!: number;

  @Field(() => Float)
  balance!: number;

  @Field({ nullable: true })
  created_at?: string;

  @Field({ nullable: true })
  updated_at?: string;
}

@ObjectType()
export class DonorsSummaryRow {
  @Field()
  id!: string;

  @Field(() => Int)
  serial_number!: number;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field(() => Float)
  monthly_amount!: number;

  @Field(() => Float)
  balance!: number;
}

@ObjectType()
export class DeleteDonorResult {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
