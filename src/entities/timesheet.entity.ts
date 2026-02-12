import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('timesheets')
export class Timesheet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'date' })
    week_start_date: Date;

    @Column({ type: 'date' })
    week_end_date: Date;

    @Column({ default: 'draft' })
    status: string; // draft/submitted/approved

    @Column({ type: 'date', nullable: true })
    submission_date: Date;

    @Column({ type: 'date', nullable: true })
    approval_date: Date;

    @Column({ nullable: true })
    approved_by_employee_id: string;

    @Column({ nullable: true })
    approver_comments: string;

    @CreateDateColumn()
    created_at: Date;
}
