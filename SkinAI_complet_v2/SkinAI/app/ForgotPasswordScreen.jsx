import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { resetPassword } from "../services/supabase";

const C = {
  bg: "#0D0A0B", card: "#1E181A", border: "#2E2226",
  gold: "#C9A84C", goldDim: "#7A6230", rose: "#D4768A",
  cream: "#F2EBE1", muted: "#8A7A7F", red: "#D46060", green: "#6BBF8E",
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  function validate() {
    if (!email.trim()) { setError("Email requis"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Email invalide"); return false; }
    setError("");
    return true;
  }

  async function handleReset() {
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  // ── Écran de succès ───────────────────────────────────────────
  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: "center" }]}>
          <View style={styles.successWrap}>
            <LinearGradient colors={[C.green + "33", C.gold + "22"]} style={styles.successCircle}>
              <Text style={{ fontSize: 52 }}>📩</Text>
            </LinearGradient>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Un lien de réinitialisation a été envoyé à{"\n"}
              <Text style={{ color: C.gold, fontWeight: "700" }}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Vérifie ta boîte mail (et le dossier spam). Le lien expire dans 1 heure.
            </Text>

            <TouchableOpacity onPress={() => setSent(false)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Renvoyer l'email</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <LinearGradient colors={[C.gold, C.rose]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>✦  Retour à la connexion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          {/* Illustration */}
          <View style={styles.illustrationWrap}>
            <LinearGradient colors={[C.gold + "22", C.rose + "11"]} style={styles.illustrationCircle}>
              <Text style={{ fontSize: 56 }}>🔑</Text>
            </LinearGradient>
          </View>

          <Text style={styles.pageTitle}>Mot de passe oublié ?</Text>
          <Text style={styles.pageSubtitle}>
            Pas de panique ! Entre ton adresse email et on t'envoie un lien pour réinitialiser ton mot de passe.
          </Text>

          {/* Champ email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>ADRESSE EMAIL</Text>
            <View style={[styles.inputWrap, error && styles.inputError]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="ton@email.com"
                placeholderTextColor={C.muted}
                value={email}
                onChangeText={v => { setEmail(v); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Le lien de réinitialisation est valable pendant 1 heure. Assure-toi d'utiliser la même adresse email avec laquelle tu t'es inscrit(e).
            </Text>
          </View>

          {/* Bouton envoyer */}
          <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={loading ? [C.goldDim, "#5A3040"] : [C.gold, C.rose]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.sendBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.sendBtnText}>📩  Envoyer le lien</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Retour connexion */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backLoginWrap}>
            <Text style={styles.backLoginText}>
              Je me souviens de mon mot de passe{"  "}
              <Text style={styles.backLoginLink}>Se connecter</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: C.bg },
  scroll:             { flexGrow: 1, padding: 24, paddingBottom: 48 },
  backBtn:            { marginBottom: 8 },
  backText:           { fontSize: 14, color: C.gold, fontWeight: "600" },
  illustrationWrap:   { alignItems: "center", marginVertical: 32 },
  illustrationCircle: { width: 130, height: 130, borderRadius: 65, alignItems: "center", justifyContent: "center" },
  pageTitle:          { fontSize: 26, fontWeight: "700", color: C.cream, marginBottom: 10 },
  pageSubtitle:       { fontSize: 14, color: C.muted, lineHeight: 22, marginBottom: 28 },
  fieldWrap:          { gap: 7, marginBottom: 20 },
  fieldLabel:         { fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: "600" },
  inputWrap:          { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 54 },
  inputError:         { borderColor: C.red },
  inputIcon:          { fontSize: 16, marginRight: 10 },
  input:              { flex: 1, color: C.cream, fontSize: 15 },
  errorText:          { fontSize: 12, color: C.red },
  infoCard:           { flexDirection: "row", gap: 10, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 24 },
  infoIcon:           { fontSize: 16, marginTop: 1 },
  infoText:           { flex: 1, fontSize: 13, color: C.muted, lineHeight: 20 },
  sendBtn:            { borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", elevation: 6, marginBottom: 20 },
  sendBtnText:        { fontSize: 17, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  backLoginWrap:      { alignItems: "center" },
  backLoginText:      { fontSize: 13, color: C.muted },
  backLoginLink:      { color: C.gold, fontWeight: "700" },
  // Succès
  successWrap:        { alignItems: "center", paddingVertical: 40, gap: 20 },
  successCircle:      { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle:       { fontSize: 28, fontWeight: "700", color: C.cream },
  successText:        { fontSize: 15, color: C.muted, textAlign: "center", lineHeight: 24 },
  successHint:        { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 20, opacity: 0.7 },
  retryBtn:           { paddingVertical: 10 },
  retryText:          { fontSize: 14, color: C.gold, fontWeight: "600" },
  loginBtn:           { borderRadius: 16, height: 54, paddingHorizontal: 32, alignItems: "center", justifyContent: "center", elevation: 6 },
  loginBtnText:       { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
});
