// T12: RatingSlider Component
// A tappable 1-10 rating input with warm coffee colors

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RatingSliderProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  optional?: boolean;
}

const RATING_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function RatingSlider({
  label,
  value,
  onChange,
  optional = false,
}: RatingSliderProps) {
  const handlePress = (num: number) => {
    // If tapping the already-selected value and rating is optional, clear it
    if (value === num && optional) {
      onChange(null);
    } else {
      onChange(num);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueDisplay}>
          {value != null ? `${value}/10` : optional ? 'Not rated' : 'Select'}
        </Text>
      </View>
      <View style={styles.row}>
        {RATING_VALUES.map((num) => {
          const isSelected = value != null && num <= value;
          const isExact = value === num;

          return (
            <TouchableOpacity
              key={num}
              onPress={() => handlePress(num)}
              style={[
                styles.circle,
                isSelected && styles.circleFilled,
                isExact && styles.circleExact,
              ]}
              activeOpacity={0.7}
              accessibilityLabel={`Rate ${num} out of 10`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.circleText,
                  isSelected && styles.circleTextFilled,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {optional && value != null && (
        <TouchableOpacity
          onPress={() => onChange(null)}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear rating</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A1A',
  },
  valueDisplay: {
    fontSize: 14,
    color: '#8B5E3C',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0E6D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4C4B0',
  },
  circleFilled: {
    backgroundColor: '#8B5E3C',
    borderColor: '#8B5E3C',
  },
  circleExact: {
    backgroundColor: '#6B4226',
    borderColor: '#6B4226',
    transform: [{ scale: 1.1 }],
  },
  circleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7B6B',
  },
  circleTextFilled: {
    color: '#FFFFFF',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 13,
    color: '#B0A090',
  },
});
