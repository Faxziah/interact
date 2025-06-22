import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';



@Entity('translations')
@Index(['userId', 'createdAt'])
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { name: 'original_text' })
  originalText: string;

  @Column('text', { name: 'translated_text' })
  translatedText: string;

  @Column({ length: 50, name: 'source_language' })
  sourceLanguage: string;

  @Column({ length: 50, name: 'target_language' })
  targetLanguage: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'formal',
    name: 'translation_style',
  })
  translationStyle: string;

  @Column({ length: 50, name: 'ai_model_used' })
  aiModelUsed: string;

  @Column({ name: 'character_count' })
  characterCount: number;

  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs?: number;

  @Column({ default: false, name: 'is_favorite' })
  isFavorite: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 