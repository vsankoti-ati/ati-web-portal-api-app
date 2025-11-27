import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('holidays')
export class Holiday {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    year: number;

    @Column()
    client: string;

    @Column({ type: 'date' })
    date: string;

    @Column()
    occasion: string;

    @CreateDateColumn()
    created_at: Date;
}
