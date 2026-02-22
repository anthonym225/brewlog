// T27: Photo Capture & Storage utilities
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Open the image library picker and return the selected photo URIs.
 * Returns an empty array if the user cancels or denies permission.
 */
export async function pickPhotos(): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => asset.uri);
}

/**
 * Copy a photo URI to the app's permanent document directory,
 * resize it to max 1200px wide, and return the new file path.
 */
export async function savePhotoToStorage(uri: string): Promise<string> {
  // Ensure the photos directory exists
  const photosDir = new Directory(Paths.document, 'photos');
  if (!photosDir.exists) {
    photosDir.create();
  }

  // Generate a unique filename
  const suffix = Math.floor(Math.random() * 1e9).toString(36);
  const filename = `photo_${Date.now()}_${suffix}.jpg`;

  // Resize and compress via ImageManipulator
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.85, format: SaveFormat.JPEG }
  );

  // Move the manipulated file to the permanent photos directory
  const destFile = new File(photosDir, filename);
  const tempFile = new File(manipulated.uri);
  tempFile.move(destFile);

  return destFile.uri;
}

/**
 * Delete a photo file from disk. No-op if the file doesn't exist.
 */
export async function deletePhotoFile(filePath: string): Promise<void> {
  const file = new File(filePath);
  if (file.exists) {
    file.delete();
  }
}
