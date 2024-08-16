import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';

@Injectable()
export class NotificationService {
  create(createNotificationDto: CreateNotificationDto) {
    console.log(createNotificationDto);
    return 'This action adds a new notification';
  }

  findAll() {
    return 'This action returns all notification';
  }

  findOne(id: number) {
    console.log(id);

    return 'This action return a #${id} notification';
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    console.log(updateNotificationDto);

    return 'This action updates a #${updateNotificationDto} notification';
  }

  remove(id: number) {
    console.log(id);

    return 'This action removes a #${id} notification';
  }
}
