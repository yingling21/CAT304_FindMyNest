import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
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

    const filePath = `property-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Read file as base64 using expo-file-system
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convert base64 to ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(filePath, byteArray, { 
        upsert: true,
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

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
