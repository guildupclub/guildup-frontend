import { ref, push, update } from "firebase/database";
import database from "../../../firebase";
import { removeSpecialCharacters } from "../utils/StringUtils";

interface NotificationData {
  userId: string; // Recipient's user ID
  type: "post_like" | "post_comment" | "comment_reply";
  message: string;
  read: boolean;
  createdAt: string;
  data: {
    postId: string;
    userId: string; // Sender's user ID
    userName: string;
    userImage: string;
    commentId?: string; // For replies
  };
}

const sendNotification = async (
  recipientEmail: string,
  notification: NotificationData
) => {
  try {
    if (!recipientEmail) {
      console.log("Skipping notification: missing recipient email");
      return;
    }

    const sanitizedEmail = removeSpecialCharacters(recipientEmail);
    const notificationsRef = ref(database, `notification/${sanitizedEmail}`);
    const newNotificationRef = push(notificationsRef);

    await update(newNotificationRef, notification);
    console.log(`${notification.type} notification sent successfully`);
  } catch (error) {
    console.error(`Error sending ${notification.type} notification:`, error);
  }
};

export { sendNotification };