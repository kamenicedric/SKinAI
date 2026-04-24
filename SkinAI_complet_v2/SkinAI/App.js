import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import AnalyzeScreen from "./app/AnalyzeScreen";
import HistoryScreen from "./app/HistoryScreen";
import ProfileScreen from "./app/ProfileScreen";
import C from "./constants/colors";

const Tab = createBottomTabNavigator();

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

function AppNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <>
      <StatusBar style="light" backgroundColor={C.bg} />
      <NavigationContainer>
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
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
