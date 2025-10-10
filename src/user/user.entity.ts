import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date | null;
}
