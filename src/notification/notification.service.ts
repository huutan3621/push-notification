import { sendNotificationDTO } from './dto/send-notification.dto';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';
import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: { defaultApp: admin.app.App },
  ) {}

  private get firestore() {
    return this.firebaseAdmin.defaultApp.firestore();
  }

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

  async sendPushToAll(notification: sendNotificationDTO) {
    try {
      // Retrieve all device IDs from Firestore
      const devicesSnapshot = await this.firestore.collection('devices').get();
      const deviceTokens = devicesSnapshot.docs.map(
        (doc) => doc.data().deviceToken,
      );

      // Send notification to each device ID
      const sendPromises = deviceTokens.map((deviceToken) =>
        this.sendPushToDevice(notification, deviceToken),
      );
      const results = await Promise.all(sendPromises);

      return {
        success: true,
        message: 'Notifications sent to all devices',
        results,
      };
    } catch (error) {
      console.error('Error sending notifications to all devices:', error);
      return {
        success: false,
        message: 'An error occurred while sending notifications',
      };
    }
  }

  private async sendPushToDevice(
    notification: sendNotificationDTO,
    deviceId: string,
  ) {
    try {
      const response = await this.firebaseAdmin.defaultApp.messaging().send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: deviceId,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });

      console.log(`Notification sent successfully to ${deviceId}:`, response);
      return { deviceId, success: true, response };
    } catch (error) {
      console.error(`Error sending notification to ${deviceId}:`, error);
      return { deviceId, success: false, error };
    }
  }

  async sendPush(notification: sendNotificationDTO, id: string) {
    if (!notification.deviceId) {
      return { success: false, message: 'Device ID is required' };
    }

    try {
      const response = await this.firebaseAdmin.defaultApp.messaging().send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: id,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });

      console.log('Notification sent successfully:', response);
      return {
        success: true,
        message: 'Notification sent successfully',
        response,
      };
    } catch (error) {
      console.error('Error sending notification:', error);

      if (error && typeof error === 'object' && 'errorInfo' in error) {
        return {
          success: false,
          message: `Failed to send notification: ${error.errorInfo.message}`,
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred while sending notification',
      };
    }
  }
}
