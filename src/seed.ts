import { AppDataSource } from './data-source';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        console.log('Connected!');

        const userRepository = AppDataSource.getRepository(User);
        const employeeRepository = AppDataSource.getRepository(Employee);

        // Check if admin exists
        const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
        if (adminExists) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        console.log('Seeding initial data...');

        // 1. Create Admin User & Employee
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        const adminUser = userRepository.create({
            username: 'admin',
            email: 'admin@antigravity.com',
            password_hash: adminPassword,
            first_name: 'System',
            last_name: 'Admin',
            role: 'Admin',
            auth_provider: 'Local',
            is_active: true,
            is_email_verified: true,
        });
        await userRepository.save(adminUser);

        const adminEmployee = employeeRepository.create({
            first_name: 'System',
            last_name: 'Admin',
            email_id: 'admin@antigravity.com',
            role: 'Admin',
            date_of_joining: new Date(),
            is_active: true,
        });
        await employeeRepository.save(adminEmployee);
        console.log('✅ Admin user created');

        // 2. Create HR User & Employee
        const hrPassword = await bcrypt.hash('HR@123', 10);
        const hrUser = userRepository.create({
            username: 'hr',
            email: 'hr@antigravity.com',
            password_hash: hrPassword,
            first_name: 'Human',
            last_name: 'Resources',
            role: 'HR',
            auth_provider: 'Local',
            is_active: true,
            is_email_verified: true,
        });
        await userRepository.save(hrUser);

        const hrEmployee = employeeRepository.create({
            first_name: 'Human',
            last_name: 'Resources',
            email_id: 'hr@antigravity.com',
            role: 'HR',
            date_of_joining: new Date(),
            is_active: true,
        });
        await employeeRepository.save(hrEmployee);
        console.log('✅ HR user created');

        // 3. Create Regular Employee
        const empPassword = await bcrypt.hash('Employee@123', 10);
        const empUser = userRepository.create({
            username: 'employee',
            email: 'employee@antigravity.com',
            password_hash: empPassword,
            first_name: 'John',
            last_name: 'Doe',
            role: 'Employee',
            auth_provider: 'Local',
            is_active: true,
            is_email_verified: true,
        });
        await userRepository.save(empUser);

        const empEmployee = employeeRepository.create({
            first_name: 'John',
            last_name: 'Doe',
            email_id: 'employee@antigravity.com',
            role: 'Software Engineer',
            date_of_joining: new Date(),
            is_active: true,
        });
        await employeeRepository.save(empEmployee);
        console.log('✅ Regular employee created');

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
