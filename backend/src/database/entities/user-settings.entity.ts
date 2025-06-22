import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';


@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'en',
  })
  defaultSourceLanguage: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'es',
  })
  defaultTargetLanguage: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'formal',
  })
  defaultTranslationStyle: string;

  @Column({ type: 'boolean', default: true })
  autoSaveTranslations: boolean;

  @Column({ default: true })
  autoDetectLanguage: boolean;

  @Column({ default: false })
  emailNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserSettings>) {
    Object.assign(this, partial);
  }
} 