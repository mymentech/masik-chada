import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CollectorTotal {
  @Field()
  name!: string;

  @Field(() => Float)
  total!: number;
}

@ObjectType()
export class MonthlyReportPayment {
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  donor_serial!: number;

  @Field()
  donor_name!: string;

  @Field()
  donor_address!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  payment_date!: Date;

  @Field()
  collector_name!: string;
}

@ObjectType()
export class MonthlyReport {
  @Field(() => Float)
  collected!: number;

  @Field(() => Float)
  totalBalance!: number;

  @Field(() => [CollectorTotal])
  byCollector!: CollectorTotal[];

  @Field(() => [MonthlyReportPayment])
  payments!: MonthlyReportPayment[];
}
