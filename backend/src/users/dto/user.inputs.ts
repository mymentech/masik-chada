import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field()
  password!: string;
}

@InputType()
export class AdminUpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  currentPassword!: string;

  @Field()
  newPassword!: string;
}
