// T13: DrinkRow Component
// A drink entry row with type picker modal, name input, rating, and delete

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DRINK_TYPES } from '@/constants/drinkTypes';
import type { DrinkFormData } from '@/types';
import { RatingSlider } from '@/components/RatingSlider';

interface DrinkRowProps {
  drink: DrinkFormData;
  onChange: (updated: DrinkFormData) => void;
  onDelete: () => void;
}

export function DrinkRow({ drink, onChange, onDelete }: DrinkRowProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleTypeSelect = (type: string) => {
    onChange({ ...drink, type });
    setShowTypePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Header row with type and delete */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => setShowTypePicker(true)}
          style={styles.typePicker}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.typeText,
              !drink.type && styles.typeTextPlaceholder,
            ]}
          >
            {drink.type || 'Select type'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#8B5E3C" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          activeOpacity={0.7}
          accessibilityLabel="Delete drink"
        >
          <Ionicons name="trash-outline" size={20} color="#C0392B" />
        </TouchableOpacity>
      </View>

      {/* Name input */}
      <TextInput
        style={styles.nameInput}
        value={drink.name}
        onChangeText={(name) => onChange({ ...drink, name })}
        placeholder="Drink name (e.g. Oat Milk Lavender Latte)"
        placeholderTextColor="#B0A090"
      />

      {/* Rating */}
      <RatingSlider
        label="Rating"
        value={drink.rating || null}
        onChange={(val) => onChange({ ...drink, rating: val ?? 0 })}
      />

      {/* Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Drink Type</Text>
            <TouchableOpacity
              onPress={() => setShowTypePicker(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#3C2A1A" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={DRINK_TYPES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleTypeSelect(item)}
                style={[
                  styles.typeOption,
                  drink.type === item && styles.typeOptionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    drink.type === item && styles.typeOptionTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {drink.type === item && (
                  <Ionicons name="checkmark" size={20} color="#8B5E3C" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 12,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3C2A1A',
    flex: 1,
  },
  typeTextPlaceholder: {
    color: '#B0A090',
  },
  deleteButton: {
    padding: 8,
  },
  nameInput: {
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#3C2A1A',
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C2A1A',
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
  },
  typeOptionSelected: {
    backgroundColor: '#F5EDE3',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#3C2A1A',
  },
  typeOptionTextSelected: {
    fontWeight: '600',
    color: '#8B5E3C',
  },
});
