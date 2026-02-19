import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { EmployeeStatusEnum } from '../enum/employee-status-enum';

export class UpdateEmployeeStatusDto {
    @IsEnum(EmployeeStatusEnum)
    @IsNotEmpty()
    employee_status: string;

    @IsString()
    @IsNotEmpty()
    admin_comments: string;
}
