import { User } from '@prisma/client';
import { AuthResponseData, UserDto, toUserDto } from './auth.types';

export { UserDto };

export function userPresenter(user: User | UserDto | any): UserDto {
  if ('passwordHash' in user || !('locale' in user)) {
    return toUserDto(user as User);
  }
  return user as UserDto;
}

export function authResponsePresenter(authData: AuthResponseData): AuthResponseData {
  return {
    user: userPresenter(authData.user),
    tokens: authData.tokens,
  };
}
