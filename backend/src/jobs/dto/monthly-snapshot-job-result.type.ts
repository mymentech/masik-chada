import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MonthlySnapshotJobResult {
  @Field()
  month_key!: string;

  @Field(() => Int)
  total_donors_scanned!: number;

  @Field(() => Int)
  successful_writes!: number;

  @Field(() => Int)
  failed_donors!: number;

  @Field(() => [String])
  failed_donor_ids!: string[];

  @Field(() => Int)
  duration_ms!: number;
}
