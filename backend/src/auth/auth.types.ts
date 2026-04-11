import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../users/schemas/user.schema';

@ObjectType()
export class LoginResponse {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}
