import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HolidayCalendar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    year: number;

    @Column()
    client: string;

    @Column({ type: 'date' })
    date: Date;

    @Column()
    occasion: string;

    @Column({ type: 'text', nullable: true })
    comment: string;
}
