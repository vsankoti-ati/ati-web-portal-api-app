import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ValueTransformer } from 'typeorm';
import { User } from './user.entity';

// Date-only transformer to prevent timezone issues
const dateOnlyTransformer: ValueTransformer = {
    to: (value: any): any => {
        if (!value) return value;
        if (typeof value === 'string') {
            // Parse as UTC date only, strip time
            const dateStr = value.split('T')[0];
            return dateStr;
        }
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        return value;
    },
    from: (value: any): any => {
        if (!value) return value;
        // Return as date-only string to avoid timezone conversions
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        return value;
    }
};

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

    @Column({ type: 'date', transformer: dateOnlyTransformer })
    start_date: Date;

    @Column({ type: 'date', transformer: dateOnlyTransformer })
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
