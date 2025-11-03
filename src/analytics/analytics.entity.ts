import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Url } from 'src/url/url.entity';

@Entity({ name: 'url_analytics' })
export class UrlAnalytics {
  @Index()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'uuid', name: 'url_id' })
  readonly urlId: string;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'country' })
  readonly country: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'device' })
  readonly device: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'os' })
  readonly os: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'browser' })
  readonly browser: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ip_address' })
  readonly ipAddress: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_agent' })
  readonly userAgent: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'redirected_at' })
  readonly redirectedAt: Date;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  readonly url: Url;
}
