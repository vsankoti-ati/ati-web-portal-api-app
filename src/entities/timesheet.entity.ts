import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('timesheets')
export class Timesheet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

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

    @CreateDateColumn()
    created_at: Date;
}
