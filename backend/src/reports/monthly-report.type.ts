import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CollectorTotal {
  @Field()
  name!: string;

  @Field(() => Float)
  total!: number;
}

@ObjectType()
export class MonthlyReport {
  @Field(() => Float)
  collected!: number;

  @Field(() => Float)
  totalBalance!: number;

  @Field(() => [CollectorTotal])
  byCollector!: CollectorTotal[];
}
