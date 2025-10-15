import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  readonly username: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  readonly fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  readonly email: string;

  @Column({ type: 'varchar' })
  readonly password: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    default: null,
    name: 'verified_at',
  })
  readonly verifiedAt?: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  readonly createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_login_at',
  })
  readonly lastLoginAt?: Date | null;
}
