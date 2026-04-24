import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import C from "../constants/colors";
import { analyzeSkin } from "../services/skinAnalysis";
import { saveHistory, getHistory } from "../services/storage";
import CaptureZone from "../components/CaptureZone";
import AnalyzeButton from "../components/AnalyzeButton";
import ZoneBar from "../components/ZoneBar";
import ProductCard from "../components/ProductCard";

const SKIN_TYPES = ["Grasse", "Sèche", "Mixte", "Normale", "Sensible"];
const CONCERNS_LIST = ["Acné", "Taches", "Rides", "Pores", "Éclat", "Cernes", "Teint terne"];

function getScoreColor(score) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.gold;
  if (score >= 30) return C.orange;
  return C.red;
}

function getTagStyle(type) {
  const map = {
    warning: { bg: C.orange + "25", border: C.orange + "55", color: C.orange },
    good: { bg: C.green + "25", border: C.green + "55", color: C.green },
    info: { bg: C.gold + "25", border: C.gold + "55", color: C.gold },
    alert: { bg: C.red + "25", border: C.red + "55", color: C.red },
  };
  return map[type] || map.info;
}

export default function AnalyzeScreen() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [skinType, setSkinType] = useState("Mixte");
  const [concerns, setConcerns] = useState(["Taches"]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à votre galerie pour continuer.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setImage(compressed.uri);
      setBase64(compressed.base64);
      setMediaType("image/jpeg");
      setResult(null);
      setError(null);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à votre caméra.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setImage(compressed.uri);
      setBase64(compressed.base64);
      setMediaType("image/jpeg");
      setResult(null);
      setError(null);
    }
  }

  function handleImagePress() {
    Alert.alert("Photo du visage", "Choisissez une option", [
      { text: "📷 Caméra", onPress: takePhoto },
      { text: "🖼️ Galerie", onPress: pickImage },
      { text: "Annuler", style: "cancel" },
    ]);
  }

  function toggleConcern(c) {
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleAnalyze() {
    if (!base64) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setLoadingStep("Préparation de l'image…");
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStep("Analyse des zones cutanées…");
      const data = await analyzeSkin(base64, mediaType, skinType, concerns);
      setResult(data);

      const history = await getHistory();
      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("fr-FR"),
        score: data.score_global,
        type: data.type_peau_detecte,
        resume: data.resume,
      };
      await saveHistory([entry, ...history].slice(0, 20));
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Erreur inconnue.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}><Text style={{ fontSize: 16 }}>✦</Text></View>
          <Text style={styles.logoText}>SKIN AI</Text>
        </View>
        <Text style={styles.logoSub}>Beauté · Intelligence · Afrique</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, gap: 20 }}>
        {/* Capture */}
        <View>
          <Text style={styles.sectionTitle}>📷 Photo du visage</Text>
          <CaptureZone image={image} onPress={handleImagePress} />
        </View>

        {/* Type de peau */}
        <View>
          <Text style={styles.sectionTitle}>✨ Type de peau</Text>
          <View style={styles.card}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SKIN_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, skinType === t && styles.chipActive]}
                  onPress={() => setSkinType(t)}
                >
                  <Text style={[styles.chipText, skinType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Préoccupations */}
        <View>
          <Text style={styles.sectionTitle}>💬 Préoccupations</Text>
          <View style={[styles.card, { flexDirection: "row", flexWrap: "wrap", gap: 8 }]}>
            {CONCERNS_LIST.map((c) => {
              const active = concerns.includes(c);
              const ts = getTagStyle("info");
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.tag,
                    active
                      ? { backgroundColor: ts.bg, borderColor: ts.border }
                      : { backgroundColor: "transparent", borderColor: C.border },
                  ]}
                  onPress={() => toggleConcern(c)}
                >
                  <Text style={[styles.tagText, { color: active ? ts.color : C.muted }]}>
                    {active ? "✓ " : ""}{c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bouton */}
        <AnalyzeButton onPress={handleAnalyze} disabled={!image} loading={loading} />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={C.gold} size="large" />
            <Text style={styles.loadingText}>Analyse en cours…</Text>
            <Text style={styles.loadingStep}>{loadingStep}</Text>
          </View>
        )}

        {/* Erreur */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Résultats */}
        {result && (
          <>
            {/* Score */}
            <View>
              <Text style={styles.sectionTitle}>🔬 Diagnostic</Text>
              <View style={styles.card}>
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.score_global) }]}>
                    <Text style={[styles.scoreNum, { color: getScoreColor(result.score_global) }]}>
                      {result.score_global}
                    </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scoreTitle}>Peau {result.type_peau_detecte}</Text>
                    <Text style={styles.scoreSub}>{result.resume}</Text>
                  </View>
                </View>
                {/* Tags */}
                <View style={styles.tagsRow}>
                  {result.problemes?.map((p, i) => {
                    const ts = getTagStyle(p.type);
                    return (
                      <View key={i} style={[styles.tag, { backgroundColor: ts.bg, borderColor: ts.border }]}>
                        <Text style={[styles.tagText, { color: ts.color }]}>
                          {p.nom} · {p.severite}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Zones */}
            <View>
              <Text style={styles.sectionTitle}>🗺️ Zones du visage</Text>
              <View style={styles.card}>
                {result.zones?.map((z, i) => (
                  <ZoneBar key={i} zone={z.zone} score={z.score} />
                ))}
              </View>
            </View>

            {/* Produits */}
            <View>
              <Text style={styles.sectionTitle}>🛍️ Produits recommandés</Text>
              {result.recommandations_produits?.map((p, i) => (
                <ProductCard key={i} {...p} />
              ))}
            </View>

            {/* Conseils */}
            <View>
              <Text style={styles.sectionTitle}>💡 Routine quotidienne</Text>
              <View style={styles.card}>
                {result.conseils_quotidiens?.map((c, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={styles.tipEmoji}>{c.emoji}</Text>
                    <Text style={styles.tipText}>{c.conseil}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  logoIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: C.gold, alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 22, fontWeight: "800", color: C.cream, letterSpacing: 2 },
  logoSub: { fontSize: 11, color: C.gold, letterSpacing: 3 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 12, color: C.muted, letterSpacing: 2.5,
    textTransform: "uppercase", marginBottom: 8, fontWeight: "600",
  },
  card: {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    padding: 16, gap: 12, marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive: { backgroundColor: C.gold + "20", borderColor: C.goldDim },
  chipText: { fontSize: 14, color: C.muted },
  chipTextActive: { color: C.gold, fontWeight: "700" },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  tagText: { fontSize: 12, fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  loadingCard: {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    padding: 32, alignItems: "center", gap: 12,
  },
  loadingText: { fontSize: 16, color: C.cream, fontWeight: "600" },
  loadingStep: { fontSize: 13, color: C.muted },
  errorCard: {
    backgroundColor: C.red + "15", borderRadius: 16,
    borderWidth: 1, borderColor: C.red + "44", padding: 14,
  },
  errorText: { fontSize: 13, color: "#F08080", lineHeight: 20 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCircle: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.surface,
  },
  scoreNum: { fontSize: 24, fontWeight: "800", lineHeight: 26 },
  scoreMax: { fontSize: 10, color: C.muted },
  scoreTitle: { fontSize: 18, color: C.cream, fontWeight: "700", marginBottom: 4 },
  scoreSub: { fontSize: 12, color: C.muted, lineHeight: 18 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipEmoji: { fontSize: 18, marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: C.cream, lineHeight: 20 },
});
