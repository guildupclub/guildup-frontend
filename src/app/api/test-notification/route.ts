import { NextResponse } from "next/server";
import webpush from "web-push";

export async function GET() {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidContact = process.env.VAPID_CONTACT_EMAIL;

    // Verify environment variables
    if (!vapidPublicKey || !vapidPrivateKey || !vapidContact) {
      return NextResponse.json(
        {
          error: "Missing VAPID configuration",
          publicKey: !!vapidPublicKey,
          privateKey: !!vapidPrivateKey,
          contact: !!vapidContact,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "Configuration valid",
      publicKey: vapidPublicKey,
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Failed to validate push notification setup" },
      { status: 500 }
    );
  }
}
