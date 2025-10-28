import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Url } from 'src/url/url.entity';

@Entity({ name: 'url_analytics' })
export class UrlAnalytics {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'uuid', name: 'url_id' })
  readonly urlId: string;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'country' })
  readonly country: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ip' })
  readonly ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_agent' })
  readonly userAgent: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'redirected_at' })
  readonly redirectedAt: Date;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  readonly url: Url;
}
