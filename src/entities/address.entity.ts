import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    type: string; // home/work/etc

    @Column({ nullable: true })
    email_id: string;

    @Column({ nullable: true })
    address_line_1: string;

    @Column({ nullable: true })
    address_line_2: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    zipcode: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column({ type: 'text', nullable: true })
    comments: string;
}
