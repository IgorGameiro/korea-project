import { randomBytes } from 'node:crypto';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import argon2 from 'argon2';

/** Password hashing with argon2id. */
@Injectable()
export class PasswordService implements OnModuleInit {
  /** Verified against when the user does not exist, so both login failures cost the same time. */
  private dummyHash = '';

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash(randomBytes(32).toString('hex'), { type: argon2.argon2id });
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  /** Always runs one argon2 verification, even without a hash; false unless a real hash matched. */
  async verify(hash: string | undefined, password: string): Promise<boolean> {
    try {
      const matches = await argon2.verify(hash ?? this.dummyHash, password);
      return matches && hash !== undefined;
    } catch {
      return false;
    }
  }
}
