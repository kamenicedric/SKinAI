import React from "react";
import { View, Text, StyleSheet } from "react-native";
import C from "../constants/colors";

const PRIORITY_COLORS = {
  Essentiel: C.green,
  Recommandé: C.gold,
  Optionnel: C.muted,
};

export default function ProductCard({ categorie, nom, raison, emoji, priorite }) {
  const badgeColor = PRIORITY_COLORS[priorite] || C.muted;
  return (
    <View style={styles.card}>
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{categorie}</Text>
        <Text style={styles.name}>{nom}</Text>
        <Text style={styles.reason}>{raison}</Text>
      </View>
      <View style={[styles.badge, { borderColor: badgeColor + "66", backgroundColor: badgeColor + "22" }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{priorite}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  emojiBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  category: {
    fontSize: 10, color: C.gold,
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 3,
  },
  name: { fontSize: 15, color: C.cream, fontWeight: "700", marginBottom: 4 },
  reason: { fontSize: 12, color: C.muted, lineHeight: 18 },
  badge: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
