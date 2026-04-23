import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth/auth.service';
import { LoginResponse } from './auth/auth.types';
import { CurrentUser, type AuthContextUser } from './common/decorators/current-user.decorator';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardSummary } from './dashboard/dashboard.type';
import { DonorsService } from './donors/donors.service';
import {
  DonorBalance,
  DonorsSummaryRow,
  DeleteDonorResult,
  DonorsPage,
} from './donors/dto/donor-balance.type';
import { DonorInput } from './donors/dto/donor.input';
import { Payment } from './payments/entities/payment.entity';
import { RecordPaymentResult } from './payments/dto/record-payment-result.type';
import { PaymentsService } from './payments/payments.service';
import { MonthlyReport } from './reports/monthly-report.type';
import { ReportsService } from './reports/reports.service';
import { AppSetting } from './settings/entities/app-setting.entity';
import { SettingsService } from './settings/settings.service';
import { User, UserRole } from './users/entities/user.entity';
import {
  AdminUpdateUserInput,
  ChangePasswordInput,
  CreateUserInput,
  UpdateProfileInput,
} from './users/dto/user.inputs';
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
    private readonly settingsService: SettingsService,
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

  @Query(() => DonorsPage)
  donorsPage(
    @Args('search', { nullable: true }) search?: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ) {
    return this.donorsService.donorsPage(search, address, offset, limit);
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

  @Query(() => AppSetting)
  appSettings() {
    return this.settingsService.get();
  }

  @Roles(UserRole.Admin)
  @Query(() => [User])
  users() {
    return this.usersService.list();
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

  @Public()
  @Mutation(() => Boolean)
  async requestPasswordReset(@Args('email') email: string): Promise<boolean> {
    await this.authService.requestPasswordReset(email);
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    await this.authService.resetPasswordWithToken(token, newPassword);
    return true;
  }

  @Mutation(() => User)
  updateProfile(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.usersService.updateProfile(user.userId, input);
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() user: AuthContextUser,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    return this.usersService.changePassword(user.userId, input);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.createUser(input);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => User)
  adminUpdateUser(
    @Args('id') id: string,
    @Args('input') input: AdminUpdateUserInput,
  ): Promise<User> {
    return this.usersService.adminUpdateUser(id, input);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => Boolean)
  adminResetUserPassword(
    @Args('id') id: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.usersService.adminResetPassword(id, newPassword);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => Boolean)
  adminDeleteUser(
    @CurrentUser() user: AuthContextUser,
    @Args('id') id: string,
    @Args('reassignToUserId') reassignToUserId: string,
  ): Promise<boolean> {
    return this.usersService.deleteUser(id, user.userId, reassignToUserId);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => AppSetting)
  updateAppSettings(
    @Args('allowDonorDelete') allowDonorDelete: boolean,
  ): Promise<AppSetting> {
    return this.settingsService.update({ allow_donor_delete: allowDonorDelete });
  }

  @Mutation(() => DonorBalance)
  createDonor(@Args('input') input: DonorInput) {
    return this.donorsService.createDonor(input);
  }

  @Mutation(() => DonorBalance)
  updateDonor(@Args('id') id: string, @Args('input') input: DonorInput) {
    return this.donorsService.updateDonor(id, input);
  }

  @Roles(UserRole.Admin)
  @Mutation(() => DeleteDonorResult)
  async deleteDonor(@Args('id') id: string): Promise<DeleteDonorResult> {
    const settings = await this.settingsService.get();
    if (!settings.allow_donor_delete) {
      throw new Error('Donor deletion is disabled. Enable it from settings first.');
    }
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

  @Roles(UserRole.Admin)
  @Mutation(() => MonthlySnapshotJobResult)
  runMonthlySnapshotJob(
    @Args('month', { nullable: true }) month?: string,
  ): Promise<MonthlySnapshotJobResult> {
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
