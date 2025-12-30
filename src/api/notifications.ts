import { supabase } from '@/lib/supabase';

export async function sendPushNotification(params: {
  pushToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  const message = {
    to: params.pushToken,
    sound: 'default',
    title: params.title,
    body: params.body,
    data: params.data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

export async function getUserPushToken(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('push_token')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to get user push token:', error);
    return null;
  }

  return data?.push_token || null;
}

export async function updateUserPushToken(userId: string, pushToken: string | null): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ push_token: pushToken })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update push token:', error);
    throw error;
  }
}
