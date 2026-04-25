import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { signIn } from "../services/supabase";

const C = {
  bg: "#0D0A0B", surface: "#161113", card: "#1E181A",
  border: "#2E2226", gold: "#C9A84C", goldDim: "#7A6230",
  rose: "#D4768A", cream: "#F2EBE1", muted: "#8A7A7F", red: "#D46060",
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email invalide";
    if (!password) e.password = "Mot de passe requis";
    else if (password.length < 6) e.password = "Minimum 6 caractères";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (err) {
      Alert.alert("Connexion échouée",
        err.message?.includes("Invalid login credentials")
          ? "Email ou mot de passe incorrect."
          : err.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerWrap}>
            <LinearGradient colors={[C.gold, C.rose]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
              <Text style={styles.logoIcon}>✦</Text>
            </LinearGradient>
            <Text style={styles.appName}>SKIN AI</Text>
            <Text style={styles.tagline}>BEAUTÉ · INTELLIGENCE · AFRIQUE</Text>
          </View>

          <Text style={styles.pageTitle}>Bon retour 👋</Text>
          <Text style={styles.pageSubtitle}>Connecte-toi pour accéder à tes analyses</Text>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>ADRESSE EMAIL</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput style={styles.input} placeholder="ton@email.com" placeholderTextColor={C.muted}
                  value={email} onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: "" })); }}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
              {errors.email ? <Text style={styles.errorText}>⚠ {errors.email}</Text> : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>MOT DE PASSE</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={C.muted}
                  value={password} onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: "" })); }}
                  secureTextEntry={!showPass} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>⚠ {errors.password}</Text> : null}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{ alignSelf: "flex-end" }}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={loading ? [C.goldDim, "#5A3040"] : [C.gold, C.rose]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.loginBtnText}>✦  Se connecter</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.sepLine} /><Text style={styles.sepText}>ou</Text><View style={styles.sepLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ alignItems: "center" }}>
              <Text style={styles.registerText}>Pas encore de compte ?{"  "}<Text style={styles.registerLink}>Créer un compte</Text></Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>⚠️ SKIN AI est un outil cosmétique. Il ne remplace pas un dermatologue.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  scroll:       { flexGrow: 1, padding: 24, paddingBottom: 40 },
  headerWrap:   { alignItems: "center", marginTop: 16, marginBottom: 32 },
  logoBox:      { width: 68, height: 68, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 14, shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  logoIcon:     { fontSize: 32, color: "#fff" },
  appName:      { fontSize: 28, fontWeight: "700", color: C.cream, letterSpacing: 4, marginBottom: 4 },
  tagline:      { fontSize: 10, color: C.gold, letterSpacing: 3, opacity: 0.7 },
  pageTitle:    { fontSize: 26, fontWeight: "700", color: C.cream, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 28 },
  form:         { gap: 16 },
  fieldWrap:    { gap: 7 },
  fieldLabel:   { fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: "600" },
  inputWrap:    { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 54 },
  inputError:   { borderColor: C.red },
  inputIcon:    { fontSize: 16, marginRight: 10 },
  input:        { flex: 1, color: C.cream, fontSize: 15 },
  errorText:    { fontSize: 12, color: C.red },
  forgotText:   { fontSize: 13, color: C.gold, fontWeight: "600" },
  loginBtn:     { borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", marginTop: 4, shadowColor: C.gold, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  loginBtnText: { fontSize: 17, fontWeight: "700", color: "#fff", letterSpacing: 1 },
  separator:    { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  sepLine:      { flex: 1, height: 1, backgroundColor: C.border },
  sepText:      { fontSize: 13, color: C.muted },
  registerText: { fontSize: 14, color: C.muted },
  registerLink: { color: C.gold, fontWeight: "700" },
  disclaimer:   { fontSize: 11, color: C.muted, textAlign: "center", marginTop: 36, lineHeight: 18, opacity: 0.55 },
});
