import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelengthUserAgent1762159175018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "url_analytics"
        ALTER COLUMN "user_agent" TYPE TEXT;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "url_analytics"
        ALTER COLUMN "user_agent" TYPE varchar(200);`);
  }
}
