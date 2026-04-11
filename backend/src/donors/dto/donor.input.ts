import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class DonorInput {
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
}
