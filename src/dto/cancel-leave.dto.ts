import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelLeaveDto {
    @ApiProperty({ example: 'Personal reasons - need to cancel', description: 'Reason for canceling the leave' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
