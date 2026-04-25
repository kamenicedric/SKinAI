import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import AnalyzeScreen from "./app/AnalyzeScreen";
import HistoryScreen from "./app/HistoryScreen";
import ProfileScreen from "./app/ProfileScreen";
import LoginScreen from "./app/LoginScreen";
import RegisterScreen from "./app/RegisterScreen";
import ForgotPasswordScreen from "./app/ForgotPasswordScreen";
import ResetPasswordScreen from "./app/ResetPasswordScreen";
import C from "./constants/colors";
import { supabase } from "./services/supabase";
import { getCurrentUser, onAuthStateChange } from "./services/supabase";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ emoji }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 2,
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 68 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          paddingHorizontal: 4,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={AnalyzeScreen}
        options={{ tabBarIcon: () => <TabIcon emoji="✦" /> }}
      />
      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{ tabBarIcon: () => <TabIcon emoji="📋" /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceResetFlow, setForceResetFlow] = useState(false);

  function parseUrlParams(url) {
    const raw = url.includes("#")
      ? url.split("#")[1]
      : url.includes("?")
        ? url.split("?")[1]
        : "";
    if (!raw) return {};

    return raw.split("&").reduce((acc, pair) => {
      const [key, value = ""] = pair.split("=");
      if (!key) return acc;
      acc[decodeURIComponent(key)] = decodeURIComponent(value);
      return acc;
    }, {});
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();

    const authListener = onAuthStateChange((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.data?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    async function handleRecoveryLink(url) {
      const params = parseUrlParams(url || "");
      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      const type = params.type;

      if (type !== "recovery" || !accessToken || !refreshToken) return;

      try {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setForceResetFlow(true);
      } catch (_err) {
        setForceResetFlow(false);
      } finally {
        setIsLoading(false);
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleRecoveryLink(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleRecoveryLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={C.gold} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={forceResetFlow ? "reset" : "main"}
      initialRouteName={forceResetFlow ? "ResetPassword" : "Main"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main">
        {() => (user ? <AppTabs /> : <AuthStack />)}
      </Stack.Screen>
      <Stack.Screen name="ResetPassword">
        {() => (
          <ResetPasswordScreen
            onPasswordUpdated={() => {
              setForceResetFlow(false);
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={C.bg} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
