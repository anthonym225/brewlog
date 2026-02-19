// T15: PhotoStrip Component
// Horizontal scrollable photo thumbnail strip with editable and display modes

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface PhotoStripProps {
  photos: string[]; // Array of local file URIs
  onAdd?: () => void;
  onDelete?: (index: number) => void;
  editable?: boolean;
}

export function PhotoStrip({
  photos,
  onAdd,
  onDelete,
  editable = false,
}: PhotoStripProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleLongPress = (index: number) => {
    if (!editable || !onDelete) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(index),
        },
      ]
    );
  };

  // If not editable and no photos, render nothing
  if (!editable && photos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((uri, index) => (
          <TouchableOpacity
            key={`photo-${index}`}
            onPress={() => setPreviewUri(uri)}
            onLongPress={() => handleLongPress(index)}
            activeOpacity={0.85}
            style={styles.thumbnailWrapper}
          >
            <Image
              source={{ uri }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={150}
            />
            {editable && onDelete && (
              <TouchableOpacity
                style={styles.deleteOverlay}
                onPress={() => handleLongPress(index)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {/* Add button (only in editable mode) */}
        {editable && onAdd && (
          <TouchableOpacity
            onPress={onAdd}
            style={styles.addButton}
            activeOpacity={0.7}
            accessibilityLabel="Add photo"
          >
            <Ionicons name="camera-outline" size={28} color="#8B5E3C" />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Full-screen preview modal */}
      <Modal
        visible={previewUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewUri(null)}
        >
          <View style={styles.previewContainer}>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                contentFit="contain"
                transition={200}
              />
            )}
            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreviewUri(null)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  deleteOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4C4B0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EDE3',
  },
  addText: {
    fontSize: 11,
    color: '#8B5E3C',
    marginTop: 2,
    fontWeight: '500',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
  },
  previewClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
});
