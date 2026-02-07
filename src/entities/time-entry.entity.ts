import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('time_entries')
export class TimeEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    timesheet_id: string;

    @Column()
    project_id: string;

    @Column({ type: 'date' })
    entry_date: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    hours: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    created_at: Date;
}
