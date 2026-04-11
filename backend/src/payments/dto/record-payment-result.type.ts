import { Field, ObjectType } from '@nestjs/graphql';
import { DashboardSummary } from '../../dashboard/dashboard.type';
import { DonorBalance } from '../../donors/dto/donor-balance.type';
import { Payment } from '../schemas/payment.schema';

@ObjectType()
export class RecordPaymentResult {
  @Field(() => Payment)
  payment!: Payment;

  @Field(() => DonorBalance)
  donor!: DonorBalance;

  @Field(() => DashboardSummary)
  dashboard!: DashboardSummary;
}
