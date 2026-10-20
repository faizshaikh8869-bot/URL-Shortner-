#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0d4bd623dcc019e0a15b66b0a75f2c68aeeff7cf207907fb120ff192ad8d8e7f/contract';
import endContract from '../../snapshots/0d4bd623dcc019e0a15b66b0a75f2c68aeeff7cf207907fb120ff192ad8d8e7f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract';
import startContract from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'Short_URL', column: 'original_URL' }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'Short_URL',
        column: 'original_url',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
