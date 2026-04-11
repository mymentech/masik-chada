import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth/auth.service';
import { LoginResponse } from './auth/auth.types';
import { CurrentUser, type AuthContextUser } from './common/decorators/current-user.decorator';
import { Public } from './common/decorators/public.decorator';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardSummary } from './dashboard/dashboard.type';
import { DonorsService } from './donors/donors.service';
import { DonorBalance, DonorsSummaryRow, DeleteDonorResult } from './donors/dto/donor-balance.type';
import { DonorInput } from './donors/dto/donor.input';
import { Payment } from './payments/schemas/payment.schema';
import { RecordPaymentResult } from './payments/dto/record-payment-result.type';
import { PaymentsService } from './payments/payments.service';
import { MonthlyReport } from './reports/monthly-report.type';
import { ReportsService } from './reports/reports.service';
import { User } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';
import { MonthlySnapshotJobResult } from './jobs/dto/monthly-snapshot-job-result.type';
import { MonthlySnapshotService } from './jobs/monthly-snapshot.service';

interface GraphqlRequestContext {
  req?: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    socket?: {
      remoteAddress?: string;
    };
  };
}

@Resolver()
export class AppResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly donorsService: DonorsService,
    private readonly paymentsService: PaymentsService,
    private readonly dashboardService: DashboardService,
    private readonly reportsService: ReportsService,
    private readonly monthlySnapshotService: MonthlySnapshotService,
  ) {}

  @Query(() => User)
  async me(@CurrentUser() user: AuthContextUser): Promise<User> {
    return this.usersService.findById(user.userId) as Promise<User>;
  }

  @Query(() => [DonorBalance])
  donors(
    @Args('search', { nullable: true }) search?: string,
    @Args('address', { nullable: true }) address?: string,
  ) {
    return this.donorsService.donors(search, address);
  }

  @Query(() => DonorBalance)
  donor(@Args('id') id: string) {
    return this.donorsService.donor(id);
  }

  @Query(() => [String])
  addresses() {
    return this.donorsService.addresses();
  }

  @Query(() => [Payment])
  payments(@Args('month', { nullable: true }) month?: string) {
    return this.paymentsService.payments(month);
  }

  @Query(() => [Payment])
  donorPayments(@Args('donorId') donorId: string) {
    return this.paymentsService.donorPayments(donorId);
  }

  @Query(() => DashboardSummary)
  dashboard() {
    return this.dashboardService.summary();
  }

  @Query(() => MonthlyReport)
  monthlyReport(@Args('month') month: string) {
    return this.reportsService.monthlyReport(month);
  }

  @Query(() => [DonorsSummaryRow])
  donorsSummary() {
    return this.donorsService.donorsSummary();
  }

  @Public()
  @Mutation(() => LoginResponse)
  login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: GraphqlRequestContext,
  ): Promise<LoginResponse> {
    return this.authService.login(email, password, this.extractClientIp(context));
  }

  @Mutation(() => DonorBalance)
  createDonor(@Args('input') input: DonorInput) {
    return this.donorsService.createDonor(input);
  }

  @Mutation(() => DonorBalance)
  updateDonor(@Args('id') id: string, @Args('input') input: DonorInput) {
    return this.donorsService.updateDonor(id, input);
  }

  @Mutation(() => DeleteDonorResult)
  deleteDonor(@Args('id') id: string): Promise<DeleteDonorResult> {
    return this.donorsService.deleteDonor(id);
  }

  @Mutation(() => RecordPaymentResult)
  recordPayment(
    @Args('donorId') donorId: string,
    @Args('amount') amount: number,
    @Args('paymentDate') paymentDate: string,
    @CurrentUser() user: AuthContextUser,
  ): Promise<RecordPaymentResult> {
    return this.recordPaymentAndRefresh(donorId, amount, paymentDate, user.userId);
  }

  @Mutation(() => MonthlySnapshotJobResult)
  runMonthlySnapshotJob(@Args('month', { nullable: true }) month?: string): Promise<MonthlySnapshotJobResult> {
    return this.monthlySnapshotService.runForMonth(month);
  }

  private extractClientIp(context: GraphqlRequestContext): string {
    const request = context.req;
    if (!request) {
      return 'unknown';
    }

    const forwarded = request.headers?.['x-forwarded-for'];
    const firstForwardedIp = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim();
    if (firstForwardedIp) {
      return firstForwardedIp;
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  private async recordPaymentAndRefresh(
    donorId: string,
    amount: number,
    paymentDate: string,
    collectorId: string,
  ): Promise<RecordPaymentResult> {
    const payment = await this.paymentsService.recordPayment(donorId, amount, paymentDate, collectorId);
    const [donor, dashboard] = await Promise.all([
      this.donorsService.donor(donorId),
      this.dashboardService.summary(),
    ]);

    return {
      payment,
      donor,
      dashboard,
    };
  }
}
