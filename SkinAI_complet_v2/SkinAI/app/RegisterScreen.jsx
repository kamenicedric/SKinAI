import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { signUp } from "../services/supabase";

const C = {
  bg: "#0D0A0B", card: "#1E181A", border: "#2E2226",
  gold: "#C9A84C", goldDim: "#7A6230", rose: "#D4768A",
  cream: "#F2EBE1", muted: "#8A7A7F", red: "#D46060", green: "#6BBF8E",
};

const SKIN_TYPES = ["Grasse", "Sèche", "Mixte", "Normale", "Sensible"];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [skinType, setSkinType]   = useState("Mixte");
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = "Prénom requis";
    if (!email.trim()) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email invalide";
    if (!password) e.password = "Mot de passe requis";
    else if (password.length < 6) e.password = "Minimum 6 caractères";
    if (password !== confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim(), skinType });
      Alert.alert(
        "Compte créé ! 🎉",
        "Un email de confirmation t'a été envoyé. Vérifie ta boîte mail avant de te connecter.",
        [{ text: "Se connecter", onPress: () => navigation.navigate("Login") }]
      );
    } catch (err) {
      Alert.alert("Erreur",
        err.message?.includes("already registered")
          ? "Cet email est déjà utilisé."
          : err.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, icon, value, onChange, keyboard = "default", secure = false, show, onToggle, error, placeholder }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput style={[styles.input, { flex: 1 }]}
          placeholder={placeholder} placeholderTextColor={C.muted}
          value={value} onChangeText={v => { onChange(v); setErrors(p => ({ ...p, [label]: "" })); }}
          keyboardType={keyboard} autoCapitalize={keyboard === "email-address" ? "none" : "words"}
          autoCorrect={false} secureTextEntry={secure && !show} />
        {onToggle && (
          <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
            <Text style={{ fontSize: 16 }}>{show ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.headerWrap}>
            <LinearGradient colors={[C.gold, C.rose]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
              <Text style={styles.logoIcon}>✦</Text>
            </LinearGradient>
            <Text style={styles.appName}>SKIN AI</Text>
          </View>

          <Text style={styles.pageTitle}>Créer un compte ✨</Text>
          <Text style={styles.pageSubtitle}>Rejoins SKIN AI et commence ton analyse personnalisée</Text>

          <View style={styles.form}>
            <Field label="PRÉNOM" icon="👤" value={fullName} onChange={setFullName} placeholder="Ton prénom" error={errors.fullName} />
            <Field label="EMAIL" icon="✉️" value={email} onChange={setEmail} placeholder="ton@email.com" keyboard="email-address" error={errors.email} />
            <Field label="MOT DE PASSE" icon="🔒" value={password} onChange={setPassword} placeholder="Min. 6 caractères" secure show={showPass} onToggle={() => setShowPass(p => !p)} error={errors.password} />
            <Field label="CONFIRMER MOT DE PASSE" icon="🔐" value={confirm} onChange={setConfirm} placeholder="Répète ton mot de passe" secure show={showConf} onToggle={() => setShowConf(p => !p)} error={errors.confirm} />

            {/* Type de peau */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>TON TYPE DE PEAU</Text>
              <View style={styles.skinRow}>
                {SKIN_TYPES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setSkinType(t)}
                    style={[styles.skinChip, skinType === t && styles.skinChipActive]}>
                    <Text style={[styles.skinChipText, skinType === t && styles.skinChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Indicateur force mot de passe */}
            {password.length > 0 && (
              <View style={styles.strengthWrap}>
                <Text style={styles.fieldLabel}>FORCE DU MOT DE PASSE</Text>
                <View style={styles.strengthBar}>
                  {[1,2,3,4].map(i => (
                    <View key={i} style={[styles.strengthSegment, {
                      backgroundColor: password.length >= i * 3
                        ? i <= 1 ? C.red : i <= 2 ? C.gold : i <= 3 ? C.gold : C.green
                        : C.border
                    }]} />
                  ))}
                </View>
                <Text style={{ fontSize: 12, color: C.muted }}>
                  {password.length < 6 ? "Faible" : password.length < 10 ? "Moyen" : password.length < 14 ? "Fort" : "Très fort"}
                </Text>
              </View>
            )}

            {/* Bouton */}
            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={loading ? [C.goldDim, "#5A3040"] : [C.gold, C.rose]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.registerBtn}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.registerBtnText}>✦  Créer mon compte</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ alignItems: "center" }}>
              <Text style={styles.loginText}>Déjà un compte ?{"  "}<Text style={styles.loginLink}>Se connecter</Text></Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            En créant un compte, tu acceptes nos conditions d'utilisation. Tes données restent confidentielles et ne sont jamais revendues.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: C.bg },
  scroll:             { flexGrow: 1, padding: 24, paddingBottom: 40 },
  backBtn:            { marginBottom: 16 },
  backText:           { fontSize: 14, color: C.gold, fontWeight: "600" },
  headerWrap:         { alignItems: "center", marginBottom: 24 },
  logoBox:            { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12, elevation: 8 },
  logoIcon:           { fontSize: 28, color: "#fff" },
  appName:            { fontSize: 24, fontWeight: "700", color: C.cream, letterSpacing: 4 },
  pageTitle:          { fontSize: 24, fontWeight: "700", color: C.cream, marginBottom: 6 },
  pageSubtitle:       { fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 28 },
  form:               { gap: 16 },
  fieldWrap:          { gap: 7 },
  fieldLabel:         { fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: "600" },
  inputWrap:          { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 54 },
  inputError:         { borderColor: C.red },
  inputIcon:          { fontSize: 16, marginRight: 10 },
  input:              { flex: 1, color: C.cream, fontSize: 15 },
  errorText:          { fontSize: 12, color: C.red },
  skinRow:            { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skinChip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  skinChipActive:     { backgroundColor: `${C.gold}20`, borderColor: C.gold },
  skinChipText:       { fontSize: 13, color: C.muted },
  skinChipTextActive: { color: C.gold, fontWeight: "700" },
  strengthWrap:       { gap: 6 },
  strengthBar:        { flexDirection: "row", gap: 6 },
  strengthSegment:    { flex: 1, height: 4, borderRadius: 2 },
  registerBtn:        { borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", marginTop: 4, elevation: 6 },
  registerBtnText:    { fontSize: 17, fontWeight: "700", color: "#fff", letterSpacing: 1 },
  loginText:          { fontSize: 14, color: C.muted },
  loginLink:          { color: C.gold, fontWeight: "700" },
  terms:              { fontSize: 11, color: C.muted, textAlign: "center", marginTop: 28, lineHeight: 18, opacity: 0.55 },
});
