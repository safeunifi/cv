import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Search, X, ChevronRight, ChevronLeft, Dumbbell } from 'lucide-react-native';
import { GolfColors, difficultyColor } from '@/constants/golf-theme';
import { ALL_DRILL_CATEGORIES } from '@/types/golf';
import type { DrillCategory, Drill } from '@/types/golf';
import { DRILL_LIBRARY } from '@/data/drills';

export default function SwingDrillsScreen() {
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
      onPress={() => router.push({ pathname: '/(tabs)/fitness/swing/drill-detail', params: { drillId: item.id } })}
    >
      <View style={styles.drillIconBox}>
        <Dumbbell size={22} color={GolfColors.primary} />
      </View>
      <View style={styles.drillContent}>
        <Text style={styles.drillName}>{item.name}</Text>
        <Text style={styles.drillDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.drillMeta}>
          <Text style={[styles.drillDifficulty, { color: difficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
          {item.targetFaults.length > 0 && <Text style={styles.drillTarget}>{item.targetFaults[0]}</Text>}
          {item.equipment.length > 0 && <Text style={styles.drillEquipment}>{item.equipment.length} items</Text>}
        </View>
      </View>
      <ChevronRight size={16} color={GolfColors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={GolfColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drill Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={GolfColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drills or faults..."
          placeholderTextColor={GolfColors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <X size={18} color={GolfColors.textSecondary} />
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
            style={[styles.filterChip, (item === null ? selectedCategory === null : selectedCategory === item) && styles.filterChipActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.filterText, (item === null ? selectedCategory === null : selectedCategory === item) && styles.filterTextActive]}>
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
  container: { flex: 1, backgroundColor: GolfColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: GolfColors.text },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: GolfColors.surface, borderRadius: 10, borderWidth: 1, borderColor: GolfColors.border,
  },
  searchInput: { flex: 1, color: GolfColors.text, fontSize: 15 },

  filterBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: GolfColors.surface, borderRadius: 16, borderWidth: 1, borderColor: GolfColors.border },
  filterChipActive: { backgroundColor: GolfColors.primary, borderColor: GolfColors.primary },
  filterText: { color: GolfColors.text, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  drillRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GolfColors.border,
  },
  drillIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(74,124,89,0.1)', justifyContent: 'center', alignItems: 'center' },
  drillContent: { flex: 1, gap: 4 },
  drillName: { color: GolfColors.text, fontSize: 15, fontWeight: '600' },
  drillDesc: { color: GolfColors.textSecondary, fontSize: 12, lineHeight: 17 },
  drillMeta: { flexDirection: 'row', gap: 10, marginTop: 2 },
  drillDifficulty: { fontSize: 11, fontWeight: '500' },
  drillTarget: { color: GolfColors.scoreFair, fontSize: 11 },
  drillEquipment: { color: GolfColors.textSecondary, fontSize: 11 },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: GolfColors.textSecondary, fontSize: 15 },
});
