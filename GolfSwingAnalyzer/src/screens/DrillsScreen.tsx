import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, difficultyColor } from '../utils/theme';
import { ALL_DRILL_CATEGORIES, DrillCategory, DrillCategoryIcons, Drill } from '../models/types';
import { DRILL_LIBRARY } from '../data/drills';

export default function DrillsScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | null>(null);
  const [searchText, setSearchText] = useState('');

  const filteredDrills = DRILL_LIBRARY.filter((drill) => {
    const matchesCategory = !selectedCategory || drill.category === selectedCategory;
    const matchesSearch = !searchText ||
      drill.name.toLowerCase().includes(searchText.toLowerCase()) ||
      drill.description.toLowerCase().includes(searchText.toLowerCase()) ||
      drill.targetFaults.some((f) => f.toLowerCase().includes(searchText.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderDrill = ({ item }: { item: Drill }) => (
    <TouchableOpacity
      style={styles.drillRow}
      onPress={() => navigation.navigate('DrillDetail', { drill: item })}
    >
      <View style={styles.drillIconBox}>
        <Ionicons
          name={(DrillCategoryIcons[item.category] || 'fitness') as any}
          size={22}
          color={Colors.primary}
        />
      </View>
      <View style={styles.drillContent}>
        <Text style={styles.drillName}>{item.name}</Text>
        <Text style={styles.drillDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.drillMeta}>
          <Text style={[styles.drillDifficulty, { color: difficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
          {item.targetFaults.length > 0 && (
            <Text style={styles.drillTarget}>{item.targetFaults[0]}</Text>
          )}
          {item.equipment.length > 0 && (
            <Text style={styles.drillEquipment}>{item.equipment.length} items</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drills or faults..."
          placeholderTextColor={Colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[null, ...ALL_DRILL_CATEGORIES]}
        keyExtractor={(item) => item ?? 'all'}
        contentContainerStyle={styles.filterBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              (item === null ? selectedCategory === null : selectedCategory === item)
                && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            {item && (
              <Ionicons
                name={(DrillCategoryIcons[item] || 'fitness') as any}
                size={12}
                color={selectedCategory === item ? Colors.white : Colors.text}
              />
            )}
            <Text style={[
              styles.filterText,
              (item === null ? selectedCategory === null : selectedCategory === item)
                && styles.filterTextActive,
            ]}>
              {item ?? 'All'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Drill List */}
      <FlatList
        data={filteredDrills}
        keyExtractor={(item) => item.id}
        renderItem={renderDrill}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No drills found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  filterBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { color: Colors.text, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: Colors.white },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drillIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(46,155,78,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillContent: { flex: 1, gap: 4 },
  drillName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  drillDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  drillMeta: { flexDirection: 'row', gap: 10, marginTop: 2 },
  drillDifficulty: { fontSize: 11, fontWeight: '500' },
  drillTarget: { color: Colors.scoreFair, fontSize: 11 },
  drillEquipment: { color: Colors.textSecondary, fontSize: 11 },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
