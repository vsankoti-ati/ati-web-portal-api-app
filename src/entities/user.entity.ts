import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ default: 'Employee' })
    role: string;

    @Column({ default: false })
    is_email_verified: boolean;

    @Column({ default: true })
    is_active: boolean;

    @Column()
    auth_provider: string; // 'Local' | 'AzureAD'

    @Column({ nullable: true })
    azure_ad_id: string;

    @Column({ nullable: true })
    employee_id: string;

    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    last_login: Date;

    @Column({ nullable: true })
    reset_token: string;

    @Column({ nullable: true })
    reset_token_expiry: Date;

    @Column({ nullable: true })
    geo_location: string; 
}
