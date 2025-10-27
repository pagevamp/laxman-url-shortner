import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiryEmailSentColumnInUrl1761528044677
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` ALTER TABLE "urls"
            ADD COLUMN "expiry_alert" BOOLEAN NOT NULL DEFAULT  false;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "urls"
            DROP COLUMN "expiry_alert"
        `);
  }
}
