import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Candidate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    address_id: string;

    @Column()
    status: string;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;
}
