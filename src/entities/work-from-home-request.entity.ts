import { Entity, Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('work_from_home_requests')
export class WorkFromHomeRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: false, type: 'date' })
    start_date: Date;

    @Column({ nullable: false, type: 'date' })
    end_date: Date;

    @Column({ nullable: false })
    reason: string;

    @Column({ nullable: false, default: 'Pending' })
    status: string;

    @Column({ nullable: true })
    approved_by: string;

    @Column({ nullable: true })
    approver_name: string;

    @Column({ nullable: true })
    approver_comments: string;

    @Column({ nullable: true, type: 'date' })
    approved_date: Date;

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;

}