import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class JobReferral {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    job_opening_id: string;

    @Column()
    referred_by: string;

    @Column()
    candidate_id: string;

    @Column()
    referral_status: string;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    created_at: Date;
}
