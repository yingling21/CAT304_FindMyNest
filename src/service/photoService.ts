import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Uploads a property photo to Supabase Storage and returns its public URL.
 * Converts HEIC images to JPEG automatically for iOS.
 */
export async function uploadPropertyPhoto(image: any): Promise<string> {
  try {
    let uri = image.uri;
    let ext = uri.split('.').pop()?.toLowerCase() || 'jpg';

    // Convert HEIC to JPEG for iOS
    if (Platform.OS === 'ios' && ext === 'heic') {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      uri = result.uri;
      ext = 'jpg';
    }

    const filePath = `temp/${Date.now()}.${ext}`;

    // Fetch the image and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(filePath, blob, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('property-photos')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) throw new Error('Failed to get public URL');

    return data.publicUrl;
  } catch (err) {
    console.error('Failed to upload photo:', err);
    throw err;
  }
}
