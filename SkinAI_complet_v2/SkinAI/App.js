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

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{
      alignItems: "center", justifyContent: "center",
      paddingVertical: 6, paddingHorizontal: 12,
      borderRadius: 16, gap: 3,
      backgroundColor: focused ? C.gold + "20" : "transparent",
    }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? C.gold : C.muted, fontWeight: focused ? "700" : "400" }}>
        {label}
      </Text>
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
              height: 64 + bottomInset,
              paddingBottom: bottomInset,
              paddingTop: 4,
            },
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen
            name="Analyser"
            component={AnalyzeScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="✦" label="Analyser" focused={focused} /> }}
          />
          <Tab.Screen
            name="Historique"
            component={HistoryScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Historique" focused={focused} /> }}
          />
          <Tab.Screen
            name="Profil"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profil" focused={focused} /> }}
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
