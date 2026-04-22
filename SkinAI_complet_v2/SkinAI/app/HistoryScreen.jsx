import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import C from "../constants/colors";
import { getHistory, saveHistory } from "../services/storage";

function getColor(score) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.gold;
  if (score >= 30) return C.orange;
  return C.red;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  async function clearHistory() {
    await saveHistory([]);
    setHistory([]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearBtn}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, gap: 12 }}>
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyText}>Aucune analyse pour le moment</Text>
            <Text style={styles.emptyHint}>Vos analyses apparaîtront ici après chaque diagnostic.</Text>
          </View>
        ) : (
          history.map((h) => {
            const color = getColor(h.score);
            return (
              <View key={h.id} style={styles.card}>
                <View style={[styles.scoreBadge, { borderColor: color, backgroundColor: color + "20" }]}>
                  <Text style={[styles.scoreNum, { color }]}>{h.score}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.skinType}>Peau {h.type}</Text>
                  <Text style={styles.resume} numberOfLines={2}>{h.resume}</Text>
                  <Text style={styles.date}>📅 {h.date}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: C.cream, letterSpacing: 1 },
  clearBtn: { fontSize: 14, color: C.red },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 16,
  },
  scoreBadge: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 20, fontWeight: "800" },
  info: { flex: 1, gap: 4 },
  skinType: { fontSize: 16, color: C.cream, fontWeight: "700" },
  resume: { fontSize: 12, color: C.muted, lineHeight: 18 },
  date: { fontSize: 11, color: C.goldDim },
  empty: {
    alignItems: "center", paddingTop: 80, gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, color: C.muted, fontWeight: "600" },
  emptyHint: { fontSize: 13, color: C.muted + "88", textAlign: "center", paddingHorizontal: 40 },
});
