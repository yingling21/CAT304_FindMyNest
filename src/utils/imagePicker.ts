import * as ImagePicker from 'expo-image-picker';
import { Platform, Keyboard } from 'react-native';

export async function pickImages() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission denied');
  }

  Keyboard.dismiss(); // close keyboard to avoid modal freeze
  await new Promise((resolve) => setTimeout(resolve, 300)); // small delay for iOS UI

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: true, // pick multiple images
    allowsEditing: false,
    ...(Platform.OS === 'ios' ? { presentationStyle: 'fullScreen' as any } : {}),
  });

  if (!result.canceled) {
    return result.assets; // return all selected images
  }

  return [];
}

