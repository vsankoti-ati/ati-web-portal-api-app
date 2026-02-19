import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelRequestDto {
    @ApiProperty({ example: 'Personal reasons - need to cancel', description: 'Reason for canceling the request' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
