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

interface DrinkRowProps {
  drink: DrinkFormData;
  onChange: (updated: DrinkFormData) => void;
  onDelete: () => void;
}

export function DrinkRow({ drink, onChange, onDelete }: DrinkRowProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [ratingText, setRatingText] = useState(
    drink.rating > 0 ? String(drink.rating) : ''
  );

  const handleTypeSelect = (type: string) => {
    onChange({ ...drink, type });
    setShowTypePicker(false);
  };

  const handleRatingTextChange = (text: string) => {
    // Allow only digits and one decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    const dotIndex = sanitized.indexOf('.');
    if (dotIndex !== -1) {
      // Limit to 1 decimal place
      setRatingText(sanitized.slice(0, dotIndex + 2));
    } else {
      setRatingText(sanitized);
    }
  };

  const handleRatingBlur = () => {
    if (ratingText === '') {
      onChange({ ...drink, rating: 0 });
      return;
    }
    const parsed = parseFloat(ratingText);
    if (isNaN(parsed)) {
      setRatingText(drink.rating > 0 ? String(drink.rating) : '');
      return;
    }
    const clamped = Math.min(10, Math.max(0.1, parsed));
    const rounded = Math.round(clamped * 10) / 10;
    onChange({ ...drink, rating: rounded });
    setRatingText(String(rounded));
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
      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>Rating</Text>
        <View style={styles.ratingInputWrapper}>
          <TextInput
            style={styles.ratingInput}
            value={ratingText}
            onChangeText={handleRatingTextChange}
            onBlur={handleRatingBlur}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor="#B0A090"
            maxLength={4}
            returnKeyType="done"
          />
          <Text style={styles.ratingMax}>/10</Text>
        </View>
      </View>

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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  ratingInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B4226',
    minWidth: 36,
    textAlign: 'right',
  },
  ratingMax: {
    fontSize: 14,
    color: '#8B7B6B',
    marginLeft: 2,
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
