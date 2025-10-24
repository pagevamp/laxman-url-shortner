import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity({ name: 'urls' })
export class Url {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  readonly userId: string;

  @Column({ type: 'varchar', length: 2048, name: 'long_code' })
  readonly longCode: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'short_code' })
  readonly shortCode: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  readonly isActive: boolean;

  @Column({ type: 'varchar', length: 64, unique: true, name: 'original_url' })
  readonly originalUrl: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  readonly deletedAt?: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  readonly user: User;

  @Column({
    type: 'timestamp with time zone',
    name: 'expires_at',
  })
  readonly expiresAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  readonly updatedAt: Date;
}
