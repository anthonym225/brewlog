// T27: Photo Capture & Storage utilities
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { generateUUID } from '@/utils/uuid';

/**
 * Open the image library picker and return the selected photo URIs.
 * Returns an empty array if the user cancels.
 * Throws an error with code 'PERMISSION_DENIED' if library access is denied.
 */
export async function pickPhotos(): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    const err = new Error('Photo library permission denied');
    (err as Error & { code: string }).code = 'PERMISSION_DENIED';
    throw err;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: 10,
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
  // Ensure the photos directory exists (idempotent — safe to call every time)
  const photosDir = new Directory(Paths.document, 'photos');
  photosDir.create({ idempotent: true });

  const filename = `photo_${generateUUID()}.jpg`;
  const destFile = new File(photosDir, filename);

  // Resize and compress via ImageManipulator
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.85, format: SaveFormat.JPEG }
  );

  // Move the manipulated file to its permanent location
  const tempFile = new File(manipulated.uri);
  try {
    tempFile.move(destFile);
  } catch (moveErr) {
    // Clean up the temp file to avoid leaking it in the cache
    try {
      tempFile.delete();
    } catch {
      // best-effort
    }
    throw moveErr;
  }

  return destFile.uri;
}

/**
 * Delete a photo file from disk. No-op if the file doesn't exist.
 */
export function deletePhotoFile(filePath: string): void {
  const file = new File(filePath);
  if (file.exists) {
    file.delete();
  }
}
