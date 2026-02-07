import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('leave_applications')
export class LeaveApplication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    leave_type: string; // Earned/Holiday/UnPaid

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ type: 'int' })
    days_requested: number;

    @Column({ type: 'text' })
    reason: string;

    @Column({ default: 'Pending' })
    status: string; // Pending/Approved/Rejected

    @Column({ type: 'datetime2' })
    applied_date: Date;

    @Column({ nullable: true })
    approved_by: string;

    @Column({ type: 'datetime2', nullable: true })
    approved_date: Date;
}
