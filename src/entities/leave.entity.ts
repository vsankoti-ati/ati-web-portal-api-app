import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class Leave {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    employee_id: string;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @Column()
    leave_type: string; // Earned/Holiday/UnPaid

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    leave_balance: number;
}
