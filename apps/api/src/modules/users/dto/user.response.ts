import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@korea-project/shared';

/** Public view of a user. Built field by field: secrets (passwordHash) can never leak through it. */
export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ example: 'ana.souza@example.com' })
  email: string;

  @ApiProperty({ enum: Object.values(Role), example: Role.USER })
  role: Role;

  @ApiProperty()
  createdAt: Date;
}

export const toUserDto = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}): UserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});
