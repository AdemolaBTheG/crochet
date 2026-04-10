import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View
        style={{
          padding: 20,
          borderRadius: 24,
          borderCurve: "continuous",
          backgroundColor: "#F4F8FF",
          gap: 10,
        }}
      >
        <Text selectable style={{ fontSize: 28, fontWeight: "700" }}>
          YarnPal
        </Text>
        <Text selectable style={{ fontSize: 16, lineHeight: 22, color: "#3A3A3C" }}>
          Learn your first stitches, pick a beginner project, and jump back into
          whatever you were making without losing your place.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text selectable style={{ fontSize: 20, fontWeight: "700" }}>
          Start here
        </Text>
        <Link href="/(tabs)/(learn)" asChild>
          <Pressable
            style={{
              padding: 18,
              borderRadius: 20,
              borderCurve: "continuous",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E5EA",
              gap: 6,
            }}
          >
            <View>
              <Text selectable style={{ fontSize: 17, fontWeight: "600" }}>
                Continue beginner lessons
              </Text>
              <Text selectable style={{ color: "#636366", lineHeight: 20 }}>
                Learn chain stitch, single crochet, double crochet, and magic
                ring in a simple order.
              </Text>
            </View>
          </Pressable>
        </Link>
        <Link href="/(tabs)/(projects)" asChild>
          <Pressable
            style={{
              padding: 18,
              borderRadius: 20,
              borderCurve: "continuous",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E5EA",
              gap: 6,
            }}
          >
            <View>
              <Text selectable style={{ fontSize: 17, fontWeight: "600" }}>
                Resume your current project
              </Text>
              <Text selectable style={{ color: "#636366", lineHeight: 20 }}>
                Open your active pattern, keep count of rows and rounds, and
                pick up exactly where you stopped.
              </Text>
            </View>
          </Pressable>
        </Link>
      </View>

      <View style={{ gap: 12 }}>
        <Text selectable style={{ fontSize: 20, fontWeight: "700" }}>
          MVP priorities
        </Text>
        <View
          style={{
            padding: 18,
            borderRadius: 20,
            borderCurve: "continuous",
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E5E5EA",
            gap: 8,
          }}
        >
          <Text selectable style={{ fontSize: 16 }}>
            1. Learn a core stitch
          </Text>
          <Text selectable style={{ fontSize: 16 }}>
            2. Start a beginner pattern
          </Text>
          <Text selectable style={{ fontSize: 16 }}>
            3. Track progress until it is finished
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
