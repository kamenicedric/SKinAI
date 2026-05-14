import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import C from "../constants/colors";
import { getHistory } from "../services/storage";

export default function ProfileScreen() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)
    : null;

  const stats = [
    { label: "Analyses réalisées", value: history.length.toString() },
    { label: "Score moyen", value: avgScore ? `${avgScore}/100` : "—" },
    { label: "Dernière analyse", value: history[0]?.date || "Aucune" },
  ];

  const tips = [
    "Nettoyez votre visage matin et soir avec un produit doux.",
    "Utilisez une protection solaire SPF 30+ tous les jours.",
    "Hydratez votre peau avec une crème adaptée à votre type de peau.",
    "Évitez de changer trop souvent de produits actifs.",
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.pageTitle}>Mon profil</Text>
          <Text style={styles.pageSubtitle}>Suivez votre progression et gardez une routine régulière.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Indicateurs</Text>
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rappels utiles</Text>
          {tips.map((tip, i) => (
            <View key={`${tip}-${i}`} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            SKIN AI est un outil d'aide cosmétique. Pour une pathologie de peau ou un symptôme persistant, consultez un professionnel de santé.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 16,
    gap: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", color: C.cream },
  pageSubtitle: { fontSize: 14, color: C.muted, lineHeight: 20 },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 17, color: C.cream, fontWeight: "700" },
  statsGrid: { gap: 8 },
  statCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 12,
    gap: 3,
  },
  statValue: { color: C.gold, fontSize: 20, fontWeight: "700" },
  statLabel: { color: C.muted, fontSize: 13 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tipBullet: { color: C.gold, fontSize: 16, lineHeight: 20 },
  tipText: { flex: 1, color: C.cream, fontSize: 13, lineHeight: 20 },
  disclaimerCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 14,
  },
  disclaimerText: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
});
