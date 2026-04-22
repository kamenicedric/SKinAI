import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import C from "../constants/colors";

export default function AnalyzeButton({ onPress, disabled, loading }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85}>
      <LinearGradient
        colors={disabled || loading ? [C.goldDim, C.roseDim] : [C.gold, C.rose]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      >
        {loading ? (
          <ActivityIndicator color={C.white} size="small" />
        ) : (
          <View style={styles.row}>
            <Text style={styles.icon}>✦</Text>
            <Text style={styles.text}>Analyser ma peau</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { fontSize: 18, color: C.white },
  text: {
    fontSize: 17,
    color: C.white,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
