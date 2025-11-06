import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1760500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" varchar(255) NOT NULL UNIQUE,
        "full_name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "verified_at" timestamp with time zone DEFAULT NULL,
        "created_at" timestamp with time zone DEFAULT now(),
        "last_login_at" timestamp with time zone DEFAULT NULL,
        "deleted_at" timestamp with time zone DEFAULT NULL
      );

      CREATE INDEX "IDX_users_full_name" ON "users" ("full_name");
      CREATE INDEX "IDX_users_created_at" ON "users" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_created_at');
    await queryRunner.query(`
      DROP INDEX IF EXIST "IDX_users_full_name";
      DROP INDEX IF EXISTS "IDX_users_created_at";
      DROP TABLE "users";`);
  }
}
