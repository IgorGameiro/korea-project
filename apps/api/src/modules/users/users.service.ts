import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

/** Emails are compared and stored trimmed and lowercased. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  /** Includes passwordHash: for credential checks inside the API only, never for responses. */
  findByEmailWithSecret(email: string) {
    return this.repository.findByEmail(normalizeEmail(email));
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  /** Public author info (id and name only), keyed by id: for showing who wrote what. */
  async findPublicProfiles(ids: string[]): Promise<Map<string, { id: string; name: string }>> {
    if (ids.length === 0) return new Map();
    const rows = await this.repository.findPublicByIds([...new Set(ids)]);
    return new Map(rows.map((row) => [row.id, row]));
  }

  async create(input: { name: string; email: string; passwordHash: string }) {
    const email = normalizeEmail(input.email);
    if (await this.repository.findByEmail(email)) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'An account with this email already exists',
      });
    }
    return this.repository.create({ ...input, name: input.name.trim(), email });
  }
}
