import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TimeEntry } from './time-entry.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column()
    status: string; // active/completed

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.project)
    timeEntries: TimeEntry[];
}
