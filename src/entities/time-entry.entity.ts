import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimeEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    timesheet_id: string;

    @Column()
    project_id: string;

    @Column({ type: 'date' })
    entry_date: Date;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    hours_worked: number;

    @Column({ type: 'text', nullable: true })
    notes: string;
}
