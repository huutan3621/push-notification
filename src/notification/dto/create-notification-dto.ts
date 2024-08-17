import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  body: string;
  @ApiProperty()
  deviceId: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  imageUrl: string;
}
