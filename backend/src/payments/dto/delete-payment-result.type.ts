import { Field, ObjectType } from '@nestjs/graphql';
import { DashboardSummary } from '../../dashboard/dashboard.type';
import { DonorBalance } from '../../donors/dto/donor-balance.type';

@ObjectType()
export class DeletePaymentResult {
  @Field(() => DonorBalance)
  donor!: DonorBalance;

  @Field(() => DashboardSummary)
  dashboard!: DashboardSummary;
}
