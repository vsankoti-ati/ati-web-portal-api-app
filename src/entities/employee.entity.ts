import { EmployeeEnum } from '../enum/employee-enum';
import { EmployeeTypeEnum } from '../enum/employee-type-enum';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    role: string; // Admin/Employee/HR

    @Column({ unique: true })
    email_id: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;

    @Column({ type: 'date' })
    date_of_joining: Date;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    admin_comments: string;

    @Column({ nullable: false, default: EmployeeEnum.INDIA })
    geo_location: EmployeeEnum; 

    @Column({ nullable: false, default: EmployeeTypeEnum.FULL_TIME })
    type: EmployeeTypeEnum; // Full-time/Part-time/Contract

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
