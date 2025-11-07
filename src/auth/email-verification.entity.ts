import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  Index,
  DeleteDateColumn,
} from 'typeorm';

@Entity('email_verifications')
export class EmailVerification {
  @Index()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'user_id' })
  readonly userId: string;

  @OneToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  readonly user: User;

  @Index('IDX_email_verifications_token')
  @Column({ length: 255 })
  readonly token: string;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  readonly deletedAt?: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  readonly createdAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  readonly expiresAt: Date;
}
