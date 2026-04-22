import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import C from "../constants/colors";

export default function CaptureZone({ image, onPress }) {
  return (
    <View style={styles.card}>
      {image ? (
        <View>
          <Image source={{ uri: image }} style={styles.img} resizeMode="cover" />
          <View style={styles.overlay}>
            <Text style={styles.overlayLabel}>📸 Photo prête</Text>
            <TouchableOpacity style={styles.changeBtn} onPress={onPress}>
              <Text style={styles.changeBtnText}>Changer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.zone} onPress={onPress} activeOpacity={0.8}>
          <View style={[styles.corner, styles.TL]} />
          <View style={[styles.corner, styles.TR]} />
          <View style={[styles.corner, styles.BL]} />
          <View style={[styles.corner, styles.BR]} />
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📷</Text>
          </View>
          <Text style={styles.mainText}>Photographier votre visage</Text>
          <Text style={styles.hint}>Bonne lumière naturelle · Visage dégagé</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const CORNER = 28;
const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  zone: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: C.gold,
    borderWidth: 2,
  },
  TL: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  TR: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  BL: { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  BR: { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: C.goldDim, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  iconText: { fontSize: 28 },
  mainText: { fontSize: 16, color: C.cream, fontWeight: "600" },
  hint: { fontSize: 12, color: C.muted },
  img: { width: "100%", height: 220 },
  overlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 12, paddingHorizontal: 16,
  },
  overlayLabel: { fontSize: 13, color: C.cream },
  changeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.border,
  },
  changeBtnText: { fontSize: 12, color: C.gold },
});
