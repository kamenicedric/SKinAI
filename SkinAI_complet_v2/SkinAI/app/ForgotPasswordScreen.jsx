import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "../services/supabase";
import C from "../constants/colors";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!email.trim()) {
      setError("Veuillez renseigner votre email.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email invalide.");
      return false;
    }
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
      setError(err.message || "Envoi impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: "center" }]}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Email envoyé</Text>
            <Text style={styles.successText}>
              Un lien de réinitialisation a été envoyé à {"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Vérifiez votre boîte mail et vos courriers indésirables. Le lien est valable 1 heure.
            </Text>

            <TouchableOpacity onPress={() => setSent(false)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Renvoyer le lien</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.headerCard}>
            <Text style={styles.pageTitle}>Réinitialiser le mot de passe</Text>
            <Text style={styles.pageSubtitle}>
              Entrez votre adresse email. Nous vous envoyons un lien sécurisé pour créer un nouveau mot de passe.
            </Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Adresse email</Text>
            <View style={[styles.inputWrap, error && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="nom@email.com"
                placeholderTextColor={C.muted}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Utilisez la même adresse email que lors de votre inscription. Le lien est valide pendant 1 heure.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.9}
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Envoyer le lien</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={styles.secondaryText}>
              Vous vous souvenez du mot de passe ? <Text style={styles.secondaryLink}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  backBtn: { marginBottom: 12, alignSelf: "flex-start" },
  backText: { fontSize: 14, color: C.gold, fontWeight: "600" },
  headerCard: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  pageTitle: { fontSize: 27, fontWeight: "700", color: C.cream, marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: C.muted, lineHeight: 21 },
  fieldWrap: { gap: 8, marginBottom: 20 },
  fieldLabel: { fontSize: 13, color: C.cream, fontWeight: "600" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputError: { borderColor: C.red },
  input: { flex: 1, color: C.cream, fontSize: 15 },
  errorText: { fontSize: 12, color: C.red },
  infoCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 22,
  },
  infoText: { fontSize: 13, color: C.muted, lineHeight: 20 },
  primaryBtn: {
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.gold,
  },
  primaryBtnDisabled: { backgroundColor: C.goldDim },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: C.bg },
  secondaryText: { fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 20 },
  secondaryLink: { color: C.gold, fontWeight: "700" },
  successCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 22,
    gap: 14,
  },
  successTitle: { fontSize: 26, fontWeight: "700", color: C.cream, textAlign: "center" },
  successText: { fontSize: 15, color: C.muted, textAlign: "center", lineHeight: 22 },
  emailHighlight: { color: C.gold, fontWeight: "700" },
  successHint: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 20, opacity: 0.8 },
  secondaryBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryBtnText: { color: C.cream, fontWeight: "600", fontSize: 14 },
});
