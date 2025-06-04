import { NextResponse } from "next/server";
import webpush from "web-push";

// Configure web-push with VAPID keys from environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidContact = process.env.VAPID_CONTACT_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !vapidContact) {
  throw new Error(
    "VAPID keys and contact email must be set in environment variables"
  );
}

webpush.setVapidDetails(
  `mailto:${vapidContact}`,
  vapidPublicKey,
  vapidPrivateKey
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, notification } = body;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: notification.title,
        message: notification.message,
        data: notification.data,
        url: notification.url,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
