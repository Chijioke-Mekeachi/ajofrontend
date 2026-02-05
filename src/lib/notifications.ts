import { apiPost } from "@/lib/backend";

export type NotificationType =
  | "group_invite"
  | "group_joined"
  | "join_request"
  | "contribution_reminder"
  | "payment_success"
  | "payout_received"
  | "referral_bonus";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  data = {},
  sendEmail = true,
  sendPush = true,
}: SendNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiPost<{ success: boolean; error?: string }>(
      "/api/send-notification",
      {
        user_id: userId,
        type,
        title,
        message,
        data,
        send_email: sendEmail,
        send_push: sendPush,
      }
    );

    return { success: true, ...result };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
