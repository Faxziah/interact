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

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  originalText: string;

  @Column('text')
  translatedText: string;

  @Column({ length: 50 })
  sourceLanguage: string;

  @Column({ length: 50 })
  targetLanguage: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'formal',
  })
  translationStyle: string;

  @Column({ length: 50 })
  aiModelUsed: string;

  @Column()
  characterCount: number;

  @Column()
  processingTimeMs: number;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<Translation>) {
    Object.assign(this, partial);
    if (this.originalText) {
      this.characterCount = this.originalText.length;
    }
  }
} 