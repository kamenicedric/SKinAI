import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import C from "../constants/colors";
import { analyzeSkin } from "../services/skinAnalysis";
import { saveHistory, getHistory } from "../services/storage";

const SKIN_TYPES = ["Grasse", "Sèche", "Mixte", "Normale", "Sensible"];
const CONCERNS_LIST = ["Acné", "Taches", "Rides", "Pores", "Éclat", "Cernes", "Teint terne"];

function getScoreColor(score) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.gold;
  if (score >= 30) return C.orange;
  return C.red;
}

function getApiErrorMessage(error) {
  const data = error?.response?.data;
  const detailMsg = Array.isArray(data?.details) && data.details.length > 0 ? data.details[0] : null;
  return detailMsg || data?.error || error?.message || "Erreur inconnue.";
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
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
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
    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!cameraResult.canceled) {
      const uri = cameraResult.assets[0].uri;
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
    Alert.alert("Photo du visage", "Choisissez une source", [
      { text: "Prendre une photo", onPress: takePhoto },
      { text: "Choisir dans la galerie", onPress: pickImage },
      { text: "Annuler", style: "cancel" },
    ]);
  }

  function toggleConcern(c) {
    setConcerns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function handleAnalyze() {
    if (!base64) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setLoadingStep("Préparation de l'image...");
      await new Promise((r) => setTimeout(r, 350));
      setLoadingStep("Analyse des zones cutanées...");
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
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Diagnostic peau</Text>
          <Text style={styles.heroSubtitle}>Prenez une photo nette du visage pour obtenir un bilan clair.</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Rapide</Text>
            <Text style={styles.badge}>Lisible</Text>
            <Text style={styles.badge}>Confidentiel</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Photo du visage</Text>
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9} style={styles.captureZone}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <>
                <Text style={styles.captureTitle}>Ajouter une photo</Text>
                <Text style={styles.captureHint}>Lumière naturelle, visage centré, sans filtre.</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImagePress} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>{image ? "Changer la photo" : "Choisir une source"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Contexte de peau</Text>
          <Text style={styles.subLabel}>Type de peau</Text>
          <View style={styles.chipRow}>
            {SKIN_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, skinType === t && styles.chipActive]}
                onPress={() => setSkinType(t)}
              >
                <Text style={[styles.chipText, skinType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.subLabel, { marginTop: 14 }]}>Préoccupations</Text>
          <View style={styles.chipRow}>
            {CONCERNS_LIST.map((c) => {
              const active = concerns.includes(c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleConcern(c)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAnalyze}
          disabled={!image || loading}
          activeOpacity={0.9}
          style={[styles.primaryBtn, (!image || loading) && styles.primaryBtnDisabled]}
        >
          {loading ? <ActivityIndicator size="small" color={C.bg} /> : <Text style={styles.primaryBtnText}>Lancer le diagnostic</Text>}
        </TouchableOpacity>

        {!image ? (
          <Text style={styles.helperText}>Ajoutez une photo pour commencer l'analyse.</Text>
        ) : null}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={C.gold} size="large" />
            <Text style={styles.stateTitle}>Analyse en cours</Text>
            <Text style={styles.stateText}>{loadingStep || "Traitement..."}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.stateCard, styles.errorCard]}>
            <Text style={[styles.stateTitle, { color: C.red }]}>Impossible de terminer l'analyse</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Résultat global</Text>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.score_global) }]}>
                  <Text style={[styles.scoreNum, { color: getScoreColor(result.score_global) }]}>{result.score_global}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultType}>Type détecté : {result.type_peau_detecte}</Text>
                  <Text style={styles.resultResume}>{result.resume}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Points observés</Text>
              {result.problemes?.length ? (
                result.problemes.map((p, i) => (
                  <View key={`${p.nom}-${i}`} style={styles.listRow}>
                    <Text style={styles.listTitle}>{p.nom}</Text>
                    <Text style={styles.listValue}>{p.severite}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun problème majeur détecté.</Text>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Zones du visage</Text>
              {result.zones?.length ? (
                result.zones.map((z, i) => (
                  <View key={`${z.zone}-${i}`} style={styles.listRow}>
                    <Text style={styles.listTitle}>{z.zone}</Text>
                    <Text style={styles.listValue}>{z.score}/100</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune donnée de zone disponible.</Text>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recommandations</Text>
              {result.recommandations_produits?.length ? (
                result.recommandations_produits.map((p, i) => (
                  <View key={`${p.nom}-${i}`} style={styles.productRow}>
                    <Text style={styles.productName}>{p.nom}</Text>
                    <Text style={styles.productType}>{p.type}</Text>
                    {p.pourquoi ? <Text style={styles.productReason}>{p.pourquoi}</Text> : null}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune recommandation disponible.</Text>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Routine conseillée</Text>
              {result.conseils_quotidiens?.length ? (
                result.conseils_quotidiens.map((c, i) => (
                  <View key={`${c.conseil}-${i}`} style={styles.tipRow}>
                    <Text style={styles.tipText}>{c.conseil}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun conseil spécifique pour le moment.</Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 36, gap: 14 },
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 16,
    gap: 8,
  },
  heroTitle: { fontSize: 27, fontWeight: "700", color: C.cream },
  heroSubtitle: { fontSize: 15, lineHeight: 22, color: C.muted },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  badge: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    color: C.muted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    overflow: "hidden",
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.cream },
  captureZone: {
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    borderRadius: 12,
    minHeight: 180,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: 220, borderRadius: 10, resizeMode: "cover" },
  captureTitle: { color: C.cream, fontSize: 16, fontWeight: "600", marginBottom: 4 },
  captureHint: { color: C.muted, fontSize: 13, textAlign: "center", lineHeight: 18 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    backgroundColor: C.surface,
  },
  secondaryBtnText: { color: C.cream, fontSize: 14, fontWeight: "600" },
  subLabel: { color: C.muted, fontSize: 13, fontWeight: "600" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive: { borderColor: C.gold, backgroundColor: `${C.gold}22` },
  chipText: { color: C.muted, fontSize: 13 },
  chipTextActive: { color: C.gold, fontWeight: "700" },
  primaryBtn: {
    borderRadius: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.gold,
  },
  primaryBtnDisabled: { backgroundColor: C.goldDim },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: C.bg },
  helperText: { fontSize: 13, color: C.muted, textAlign: "center", marginTop: -2 },
  stateCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  errorCard: { borderColor: `${C.red}66` },
  stateTitle: { fontSize: 16, color: C.cream, fontWeight: "700" },
  stateText: { fontSize: 13, color: C.muted, lineHeight: 19, textAlign: "center" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  scoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  scoreNum: { fontSize: 24, fontWeight: "800", lineHeight: 26 },
  scoreMax: { fontSize: 10, color: C.muted },
  resultType: { fontSize: 15, color: C.cream, fontWeight: "700", marginBottom: 4 },
  resultResume: { fontSize: 13, color: C.muted, lineHeight: 20 },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 10,
  },
  listTitle: { color: C.cream, fontSize: 14 },
  listValue: { color: C.gold, fontSize: 13, fontWeight: "700" },
  emptyText: { color: C.muted, fontSize: 13, lineHeight: 20 },
  productRow: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    backgroundColor: C.surface,
  },
  productName: { color: C.cream, fontSize: 14, fontWeight: "700" },
  productType: { color: C.gold, fontSize: 12, fontWeight: "600" },
  productReason: { color: C.muted, fontSize: 13, lineHeight: 19 },
  tipRow: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.surface,
    padding: 12,
  },
  tipText: { color: C.cream, fontSize: 13, lineHeight: 20 },
});
