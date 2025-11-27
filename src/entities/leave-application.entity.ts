import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class LeaveApplication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    employee_id: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @Column()
    leave_type: string; // Earned/Holiday/UnPaid

    @Column({ type: 'date' })
    from_date: Date;

    @Column({ type: 'date' })
    to_date: Date;

    @Column({ type: 'date' })
    applied_date: Date;

    @Column({ default: 'pending' })
    status: string; // pending/approved/rejected

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    created_at: Date;
}
