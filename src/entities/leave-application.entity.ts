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

    @Column({ type: 'nvarchar', length: '50' })
    leave_type: string; // Earned/Holiday/UnPaid

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ type: 'int' })
    days_requested: number;

    @Column({ type: 'nvarchar', length: 'MAX' })
    reason: string;

    @Column({ type: 'nvarchar', length: '20', default: "'Pending'" })
    status: string; // Pending/Approved/Rejected

    @Column({ type: 'datetime2', default: () => 'GETDATE()' })
    applied_date: Date;

    @Column({ type: 'uniqueidentifier', nullable: true })
    approved_by: string;

    @Column({ type: 'datetime2', nullable: true })
    approved_date: Date;

    @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
    approver_name: string;

    @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
    approver_comments: string;
}
