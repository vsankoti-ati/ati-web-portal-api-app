import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('leaves')
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    leave_type: string; // Earned/Holiday/UnPaid

    @Column({ type: 'int' })
    total_days: number;

    @Column({ type: 'int', default: 0 })
    used_days: number;

    @Column({ type: 'int' })
    remaining_days: number;

    @Column({ type: 'int' })
    year: number;
}
