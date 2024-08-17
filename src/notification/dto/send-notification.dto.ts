import { ApiProperty } from '@nestjs/swagger';
export class sendNotificationDTO {
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
