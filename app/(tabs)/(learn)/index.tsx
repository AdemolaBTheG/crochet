import React from "react";
import { ScrollView, Text, View } from "react-native";

const lessons = [
  { title: "Chain Stitch", detail: "Your foundation for almost every project." },
  { title: "Single Crochet", detail: "The easiest stitch to build confidence fast." },
  { title: "Double Crochet", detail: "A taller stitch for scarves, blankets, and wearables." },
  { title: "Magic Ring", detail: "Start amigurumi and circular projects cleanly." },
  { title: "Rows and Rounds", detail: "Understand when to turn, join, and keep count." },
];

export default function LearnScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ fontSize: 28, fontWeight: "700" }}>
          Beginner path
        </Text>
        <Text selectable style={{ fontSize: 16, lineHeight: 22, color: "#3A3A3C" }}>
          Keep the MVP focused on a short sequence of lessons that gets someone
          from zero to their first finished project.
        </Text>
      </View>

      {lessons.map((lesson, index) => (
        <View
          key={lesson.title}
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
          <Text selectable style={{ fontSize: 14, color: "#636366" }}>
            Lesson {index + 1}
          </Text>
          <Text selectable style={{ fontSize: 18, fontWeight: "600" }}>
            {lesson.title}
          </Text>
          <Text selectable style={{ color: "#636366", lineHeight: 20 }}>
            {lesson.detail}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
