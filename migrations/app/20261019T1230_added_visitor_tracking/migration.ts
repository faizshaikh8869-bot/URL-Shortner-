#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b0598fb89ef7e62890419e3efc498a10543708b0259459e534cdc21518a60e8d/contract';
import endContract from '../../snapshots/b0598fb89ef7e62890419e3efc498a10543708b0259459e534cdc21518a60e8d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract';
import startContract from '../../snapshots/f01b8808f5f5615908bec10ffcb75b0d7a7c9aa464726386dfa9cfc997fedb84/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      ...this.renameColumn({
        schema: 'public',
        table: 'Short_URL',
        column: 'original_URL',
        to: 'original_url',
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'Short_URL',
        column: 'no_visitors',
        type: 'int4',
        temporaryDefault: sql`0`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
