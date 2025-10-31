import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
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

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'device' })
  readonly device: string;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'os' })
  readonly os: string;

  @Column({ type: 'varchar', length: 40, nullable: true, name: 'browser' })
  readonly browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ip' })
  readonly ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_agent' })
  readonly userAgent: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'redirected_at' })
  readonly redirectedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  readonly deletedAt?: Date | null;

  @ManyToOne(() => Url, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  readonly url: Url;
}
