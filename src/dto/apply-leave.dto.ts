import { IsNotEmpty, IsString, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyLeaveDto {
    @ApiProperty({ example: '12345678-1234-1234-1234-123456789012', description: 'User ID (UUID)' })
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ example: 'Earned', description: 'Type of leave: Earned/Holiday/UnPaid' })
    @IsString()
    @IsNotEmpty()
    leave_type: string;

    @ApiProperty({ example: '2025-02-15', description: 'Start date in YYYY-MM-DD format' })
    @IsDateString()
    @IsNotEmpty()
    start_date: string;

    @ApiProperty({ example: '2025-02-17', description: 'End date in YYYY-MM-DD format' })
    @IsDateString()
    @IsNotEmpty()
    end_date: string;

    @ApiProperty({ example: 'Family vacation', description: 'Reason for leave' })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ example: 'pending', description: 'Leave status', required: false })
    @IsString()
    @IsOptional()
    status?: string;
}
