import React from "react";
import { View, Text, StyleSheet } from "react-native";
import C from "../constants/colors";

function getColor(score) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.gold;
  if (score >= 30) return C.orange;
  return C.red;
}

export default function ZoneBar({ zone, score }) {
  const color = getColor(score);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{zone}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.score, { color }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { width: 70, fontSize: 13, color: C.muted },
  barBg: {
    flex: 1, height: 6, backgroundColor: C.border,
    borderRadius: 3, overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  score: { width: 28, fontSize: 13, fontWeight: "700", textAlign: "right" },
});
