import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameIpColumn1762158558309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "url_analytics"
      RENAME COLUMN "ip" TO "ip_address";
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "url_analytics"
      RENAME COLUMN "ip_address" TO "ip";
    `);
  }
}
