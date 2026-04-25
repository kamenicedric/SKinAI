import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { updatePassword } from "../services/supabase";

const C = {
  bg: "#0D0A0B", card: "#1E181A", border: "#2E2226",
  gold: "#C9A84C", goldDim: "#7A6230", rose: "#D4768A",
  cream: "#F2EBE1", muted: "#8A7A7F", red: "#D46060",
};

export default function ResetPasswordScreen({ onPasswordUpdated }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!password) {
      setError("Mot de passe requis");
      return false;
    }
    if (password.length < 6) {
      setError("Minimum 6 caractères");
      return false;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    setError("");
    return true;
  }

  async function handleUpdatePassword() {
    if (!validate()) return;
    setLoading(true);
    try {
      await updatePassword(password);
      Alert.alert("Mot de passe mis à jour", "Tu peux maintenant te reconnecter en toute sécurité.");
      onPasswordUpdated?.();
    } catch (err) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerWrap}>
            <LinearGradient colors={[C.gold, C.rose]} style={styles.logoBox}>
              <Text style={styles.logoIcon}>🔐</Text>
            </LinearGradient>
            <Text style={styles.pageTitle}>Nouveau mot de passe</Text>
            <Text style={styles.pageSubtitle}>
              Crée un mot de passe fort pour sécuriser ton compte.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>NOUVEAU MOT DE PASSE</Text>
              <View style={[styles.inputWrap, error && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 caractères"
                  placeholderTextColor={C.muted}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError("");
                  }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>CONFIRMER LE MOT DE PASSE</Text>
              <View style={[styles.inputWrap, error && styles.inputError]}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Répète le mot de passe"
                  placeholderTextColor={C.muted}
                  value={confirm}
                  onChangeText={(v) => {
                    setConfirm(v);
                    setError("");
                  }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16 }}>{showConfirm ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}

            <TouchableOpacity onPress={handleUpdatePassword} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={loading ? [C.goldDim, "#5A3040"] : [C.gold, C.rose]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>✦ Enregistrer</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  headerWrap: { alignItems: "center", marginBottom: 30 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: { fontSize: 30, color: "#fff" },
  pageTitle: { fontSize: 26, fontWeight: "700", color: C.cream, marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 21 },
  form: { gap: 14 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 11, color: C.gold, letterSpacing: 1.8, fontWeight: "600" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 54,
  },
  inputError: { borderColor: C.red },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: C.cream, fontSize: 15 },
  errorText: { fontSize: 12, color: C.red },
  submitBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    elevation: 6,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
});
