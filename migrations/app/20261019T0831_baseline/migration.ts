#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract';
import endContract from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Short_URL',
        columns: [
          col('Id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ShortCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('original_URL', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
        ],
        constraints: [primaryKey(['Id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('Id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['Id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Short_URL',
        constraint: 'Short_URL_ShortCode_key',
        columns: ['ShortCode'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
