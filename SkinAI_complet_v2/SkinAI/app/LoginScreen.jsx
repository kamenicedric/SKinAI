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
import { signIn } from "../services/supabase";
import C from "../constants/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Veuillez renseigner votre email.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Format email invalide.";
    if (!password) next.password = "Veuillez renseigner votre mot de passe.";
    else if (password.length < 6) next.password = "Minimum 6 caractères.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (err) {
      Alert.alert(
        "Connexion impossible",
        err.message?.includes("Invalid login credentials")
          ? "Email ou mot de passe incorrect."
          : err.message || "Une erreur est survenue. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <Text style={styles.appName}>SKIN AI</Text>
            <Text style={styles.subtitle}>Diagnostic peau en moins de 2 minutes.</Text>
          </View>

          <Text style={styles.pageTitle}>Connexion</Text>
          <Text style={styles.pageSubtitle}>Retrouvez vos analyses et recommandations personnalisées.</Text>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Adresse email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="nom@email.com"
                  placeholderTextColor={C.muted}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Votre mot de passe"
                  placeholderTextColor={C.muted}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={styles.toggleBtn}>
                  <Text style={styles.toggleText}>{showPass ? "Masquer" : "Afficher"}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.rightLinkWrap}>
              <Text style={styles.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>ou</Text>
              <View style={styles.sepLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ alignItems: "center" }}>
              <Text style={styles.secondaryText}>
                Pas encore de compte ? <Text style={styles.secondaryLink}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            SKIN AI est un outil cosmétique et informatif. Il ne remplace pas un avis médical.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  headerCard: {
    marginTop: 10,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  appName: { fontSize: 24, fontWeight: "700", color: C.cream, letterSpacing: 1.2, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.muted, lineHeight: 20 },
  pageTitle: { fontSize: 28, fontWeight: "700", color: C.cream, marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: C.muted, lineHeight: 21, marginBottom: 26 },
  form: { gap: 16 },
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
  rightLinkWrap: { alignSelf: "flex-end" },
  linkText: { fontSize: 14, color: C.gold, fontWeight: "600" },
  primaryBtn: {
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.gold,
    marginTop: 6,
  },
  primaryBtnDisabled: { backgroundColor: C.goldDim },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: C.bg },
  separator: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  sepLine: { flex: 1, height: 1, backgroundColor: C.border },
  sepText: { fontSize: 13, color: C.muted },
  secondaryText: { fontSize: 14, color: C.muted, lineHeight: 20 },
  secondaryLink: { color: C.gold, fontWeight: "700" },
  disclaimer: { fontSize: 12, color: C.muted, textAlign: "center", marginTop: 34, lineHeight: 18, opacity: 0.75 },
});
