import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
    Alert.alert("Effacer l'historique", "Cette action supprimera toutes les analyses enregistrées.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Effacer",
        style: "destructive",
        onPress: async () => {
          await saveHistory([]);
          setHistory([]);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.pageTitle}>Historique des diagnostics</Text>
          <Text style={styles.pageSubtitle}>Retrouvez vos analyses passées et suivez l'évolution de votre peau.</Text>
          {history.length > 0 ? (
            <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Effacer l'historique</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucune analyse enregistrée</Text>
            <Text style={styles.emptyText}>
              Lancez votre premier diagnostic depuis l'onglet Accueil. Vos résultats apparaîtront ici automatiquement.
            </Text>
          </View>
        ) : (
          history.map((h) => {
            const color = getColor(h.score);
            return (
              <View key={h.id} style={styles.itemCard}>
                <View style={[styles.scoreBadge, { borderColor: color }]}>
                  <Text style={[styles.scoreNum, { color }]}>{h.score}</Text>
                  <Text style={styles.scoreOver}>/100</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>Type de peau : {h.type}</Text>
                  <Text style={styles.itemResume} numberOfLines={2}>
                    {h.resume}
                  </Text>
                  <Text style={styles.itemDate}>{h.date}</Text>
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
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 16,
    gap: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", color: C.cream },
  pageSubtitle: { fontSize: 14, color: C.muted, lineHeight: 20 },
  clearBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${C.red}88`,
    backgroundColor: `${C.red}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearBtnText: { color: C.red, fontSize: 13, fontWeight: "600" },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 16,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, color: C.cream, fontWeight: "700" },
  emptyText: { fontSize: 14, color: C.muted, lineHeight: 20 },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  scoreNum: { fontSize: 20, fontWeight: "800", lineHeight: 21 },
  scoreOver: { fontSize: 10, color: C.muted },
  itemInfo: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 15, color: C.cream, fontWeight: "700" },
  itemResume: { fontSize: 13, color: C.muted, lineHeight: 19 },
  itemDate: { fontSize: 12, color: C.gold },
});
