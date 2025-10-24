import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginalUrlInUrlTable1761281693191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "urls"
            ADD COLUMN "original_url" VARCHAR(64) NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "urls"
            DROP COLUMN "original_url"
        `);
  }
}
