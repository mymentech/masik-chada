import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DashboardSummary {
  @Field(() => Int)
  totalDonors!: number;

  @Field(() => Float)
  thisMonthCollected!: number;

  @Field(() => Float)
  totalBalance!: number;

  @Field(() => Int)
  totalCollectors!: number;
}
