import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    type: string; // policy/handbook/form/other

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    file_url: string; // OneDrive URL or local path

    @Column({ nullable: true })
    file_size: number;

    @Column({ nullable: true })
    mime_type: string;

    @Column({ nullable: true })
    uploaded_by: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
