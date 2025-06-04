import { NextResponse } from "next/server";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    const subscription = {
      endpoint:
        "https://fcm.googleapis.com/fcm/send/fgq4J3SQT2M:APA91bENOqMNWWN-oxz1bWNfBHYyCgvr81Z7w58JsuUipVAzZc2VT9CMCzUvo2a8n-_5Yw90ZNaZAfzJ4IS1LjhEQ1w5jtcxfQpxDcEm84ZJ32p0Hf31j7KsvjwstMCejv_7fGPXj8GN",
      keys: {
        p256dh:
          "BD5hnajfmfnWkI_jxOnMdbEdwc4uCcFV2v6siVtHLwXFjubNughri42Lz0MJvk3NEj6G1igmss8e6qLSpYGFdHI",
        auth: "hANAOwosOd0vOGw1osnBJA",
      },
    };

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidContact = process.env.VAPID_CONTACT_EMAIL;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidContact) {
      throw new Error("VAPID configuration is missing");
    }

    webpush.setVapidDetails(
      `mailto:${vapidContact}`,
      vapidPublicKey,
      vapidPrivateKey
    );

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Push Message",
        message: "This is a test push notification!",
        data: {
          url: "http://localhost:3000/test-notifications",
        },
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
