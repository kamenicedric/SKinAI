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
import { signUp } from "../services/supabase";
import C from "../constants/colors";

const SKIN_TYPES = ["Grasse", "Sèche", "Mixte", "Normale", "Sensible"];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [skinType, setSkinType] = useState("Mixte");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!fullName.trim()) next.fullName = "Le prénom est requis.";
    if (!email.trim()) next.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Format email invalide.";
    if (!password) next.password = "Le mot de passe est requis.";
    else if (password.length < 6) next.password = "Minimum 6 caractères.";
    if (password !== confirm) next.confirm = "Les mots de passe ne correspondent pas.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim(), skinType });
      Alert.alert(
        "Compte créé",
        "Un email de confirmation vous a été envoyé. Validez-le avant de vous connecter.",
        [{ text: "Se connecter", onPress: () => navigation.navigate("Login") }]
      );
    } catch (err) {
      Alert.alert(
        "Inscription impossible",
        err.message?.includes("already registered")
          ? "Cet email est déjà utilisé."
          : err.message || "Une erreur est survenue. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  const Field = ({
    label,
    value,
    onChange,
    keyboard = "default",
    secure = false,
    show,
    onToggle,
    error,
    placeholder,
    autoCapitalize = "none",
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secure && !show}
        />
        {onToggle ? (
          <TouchableOpacity onPress={onToggle} style={styles.toggleBtn}>
            <Text style={styles.toggleText}>{show ? "Masquer" : "Afficher"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

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
            <Text style={styles.pageTitle}>Créer un compte</Text>
            <Text style={styles.pageSubtitle}>Un profil, vos diagnostics, vos recommandations.</Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Prénom"
              value={fullName}
              onChange={(v) => {
                setFullName(v);
                setErrors((p) => ({ ...p, fullName: "" }));
              }}
              placeholder="Votre prénom"
              error={errors.fullName}
              autoCapitalize="words"
            />
            <Field
              label="Adresse email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="nom@email.com"
              keyboard="email-address"
              error={errors.email}
            />
            <Field
              label="Mot de passe"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="Minimum 6 caractères"
              secure
              show={showPass}
              onToggle={() => setShowPass((p) => !p)}
              error={errors.password}
            />
            <Field
              label="Confirmer le mot de passe"
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                setErrors((p) => ({ ...p, confirm: "" }));
              }}
              placeholder="Répéter le mot de passe"
              secure
              show={showConf}
              onToggle={() => setShowConf((p) => !p)}
              error={errors.confirm}
            />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Type de peau</Text>
              <View style={styles.skinRow}>
                {SKIN_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSkinType(t)}
                    style={[styles.skinChip, skinType === t && styles.skinChipActive]}
                  >
                    <Text style={[styles.skinChipText, skinType === t && styles.skinChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ alignItems: "center" }}>
              <Text style={styles.secondaryText}>
                Déjà inscrit ? <Text style={styles.secondaryLink}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 14, alignSelf: "flex-start" },
  backText: { fontSize: 14, color: C.gold, fontWeight: "600" },
  headerCard: {
    marginBottom: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.surface,
  },
  pageTitle: { fontSize: 28, fontWeight: "700", color: C.cream, marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: C.muted, lineHeight: 21 },
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
  skinRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skinChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  skinChipActive: { backgroundColor: `${C.gold}20`, borderColor: C.gold },
  skinChipText: { fontSize: 13, color: C.muted },
  skinChipTextActive: { color: C.gold, fontWeight: "700" },
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
  secondaryText: { fontSize: 14, color: C.muted, lineHeight: 20 },
  secondaryLink: { color: C.gold, fontWeight: "700" },
  terms: { fontSize: 12, color: C.muted, textAlign: "center", marginTop: 28, lineHeight: 18, opacity: 0.75 },
});
