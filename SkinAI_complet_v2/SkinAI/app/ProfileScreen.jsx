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
    { label: "Analyses effectuées", value: history.length.toString(), icon: "🔬" },
    { label: "Score moyen", value: avgScore ? `${avgScore}/100` : "—", icon: "📊" },
    { label: "Conseils actifs", value: "4", icon: "💎" },
  ];

  const tips = [
    { emoji: "☀️", title: "Protection solaire", desc: "Appliquez un SPF 30+ chaque matin, même par temps nuageux." },
    { emoji: "💧", title: "Hydratation", desc: "Buvez 1,5 à 2 litres d'eau par jour pour une peau éclatante." },
    { emoji: "🌙", title: "Routine du soir", desc: "Nettoyez toujours votre visage avant de dormir." },
    { emoji: "🥗", title: "Alimentation", desc: "Privilégiez les fruits et légumes riches en antioxydants." },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, gap: 16 }}>

        {/* Avatar */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}><Text style={{ fontSize: 40 }}>👤</Text></View>
          <Text style={styles.avatarTitle}>Votre espace beauté</Text>
          <Text style={styles.avatarSub}>Analyse cutanée personnalisée pour peaux africaines</Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>📈 Statistiques</Text>
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Conseils bien-être */}
        <Text style={styles.sectionTitle}>💎 Conseils bien-être</Text>
        {tips.map((t, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{t.title}</Text>
              <Text style={styles.tipDesc}>{t.desc}</Text>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ SKIN AI est un outil d'aide cosmétique. Il ne remplace pas un avis médical ou dermatologique professionnel.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 22, fontWeight: "800", color: C.cream, letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 12, color: C.muted, letterSpacing: 2.5,
    textTransform: "uppercase", fontWeight: "600",
  },
  avatarCard: {
    backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.border,
    padding: 28, alignItems: "center", gap: 8,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.gold + "22", borderWidth: 2, borderColor: C.gold,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  avatarTitle: { fontSize: 20, color: C.cream, fontWeight: "700" },
  avatarSub: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 20 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    padding: 14, alignItems: "center", gap: 6,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 16, color: C.gold, fontWeight: "800" },
  statLabel: { fontSize: 10, color: C.muted, textAlign: "center" },
  tipCard: {
    backgroundColor: C.card, borderRadius: 18, borderWidth: 1,
    borderColor: C.gold + "30", padding: 14,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
  },
  tipEmoji: { fontSize: 22, marginTop: 2 },
  tipTitle: { fontSize: 15, color: C.cream, fontWeight: "700", marginBottom: 4 },
  tipDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  disclaimer: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  disclaimerText: { fontSize: 12, color: C.muted, lineHeight: 18, textAlign: "center" },
});
