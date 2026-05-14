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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updatePassword } from "../services/supabase";
import C from "../constants/colors";

export default function ResetPasswordScreen({ onPasswordUpdated }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!password) {
      setError("Veuillez saisir un mot de passe.");
      return false;
    }
    if (password.length < 6) {
      setError("Minimum 6 caractères.");
      return false;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
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
      Alert.alert("Mot de passe mis à jour", "Vous pouvez maintenant vous reconnecter.");
      onPasswordUpdated?.();
    } catch (err) {
      setError(err?.message || "Mise à jour impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <Text style={styles.pageTitle}>Nouveau mot de passe</Text>
            <Text style={styles.pageSubtitle}>Choisissez un mot de passe solide pour sécuriser votre compte.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Nouveau mot de passe</Text>
              <View style={[styles.inputWrap, error && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 caractères"
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
                <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={styles.toggleBtn}>
                  <Text style={styles.toggleText}>{showPass ? "Masquer" : "Afficher"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
              <View style={[styles.inputWrap, error && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Répéter le mot de passe"
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
                <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.toggleBtn}>
                  <Text style={styles.toggleText}>{showConfirm ? "Masquer" : "Afficher"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleUpdatePassword}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            >
              {loading ? <ActivityIndicator color={C.bg} size="small" /> : <Text style={styles.primaryBtnText}>Enregistrer</Text>}
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
  headerCard: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.surface,
  },
  pageTitle: { fontSize: 27, fontWeight: "700", color: C.cream, marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: C.muted, lineHeight: 21 },
  form: { gap: 14 },
  fieldWrap: { gap: 8 },
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
  toggleBtn: { paddingVertical: 4, paddingLeft: 8 },
  toggleText: { color: C.gold, fontSize: 12, fontWeight: "600" },
  errorText: { fontSize: 12, color: C.red },
  primaryBtn: {
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    backgroundColor: C.gold,
  },
  primaryBtnDisabled: { backgroundColor: C.goldDim },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: C.bg },
});
