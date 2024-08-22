import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { sendNotificationDTO } from './dto/send-notification.dto';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: { defaultApp: admin.app.App },
  ) {}

  private get firestore() {
    return this.firebaseAdmin.defaultApp.firestore();
  }

  async create(createNotificationDto: CreateNotificationDto) {
    console.log(createNotificationDto);
    // Implement your logic to save the notification to Firestore here
    return 'This action adds a new notification';
  }

  async findAll() {
    // Implement your logic to retrieve all notifications from Firestore
    return 'This action returns all notifications';
  }

  async findOne(id: number) {
    console.log(id);
    // Implement your logic to retrieve a specific notification from Firestore
    return `This action returns notification #${id}`;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    console.log(updateNotificationDto);
    // Implement your logic to update the notification in Firestore
    return `This action updates notification #${id}`;
  }

  // async remove(id: number) {
  //   console.log(id);
  //   // Implement your logic to remove the notification from Firestore
  //   return `This action removes notification #${id}`;
  // }

  //save to firebase
  private async saveNotificationToFirestore(
    notification: sendNotificationDTO,
    deviceId: string,
    messageId: string, // Change this to string
  ) {
    try {
      const notificationData = {
        title: notification.title,
        body: notification.body,
        deviceId: deviceId,
        messageId: messageId, // Store the message ID instead
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.firestore.collection('notifications').add(notificationData);
      console.log(`Notification saved to Firestore for device ID: ${deviceId}`);
    } catch (error) {
      console.error('Error saving notification to Firestore:', error);
    }
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

      // Save the notification to Firestore
      await this.saveNotificationToFirestore(notification, deviceId, response);

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
      await this.saveNotificationToFirestore(notification, id, response);

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

  async remove(id: number) {
    try {
      const notificationRef = this.firestore
        .collection('notifications')
        .doc(id.toString());
      await notificationRef.delete();
      return {
        success: true,
        message: `Notification with ID ${id} has been removed`,
      };
    } catch (error) {
      console.error(`Error removing notification with ID ${id}:`, error);
      return { success: false, message: 'Error removing notification' };
    }
  }
}
