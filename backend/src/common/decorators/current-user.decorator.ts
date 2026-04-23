import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../../users/entities/user.entity';

export interface AuthContextUser {
  userId: string;
  email: string;
  name?: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContextUser => {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req.user as AuthContextUser;
  },
);
