import React from "react";
import { ScrollView, Text, View } from "react-native";

const projects = [
  { name: "First Granny Square", status: "In progress", progress: "Round 4 of 6" },
  { name: "Starter Coaster", status: "Ready to start", progress: "Materials prepared" },
];

export default function ProjectsScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View style={{ gap: 8 }}>
        <Text selectable style={{ fontSize: 28, fontWeight: "700" }}>
          Your projects
        </Text>
        <Text selectable style={{ fontSize: 16, lineHeight: 22, color: "#3A3A3C" }}>
          This tab is where the counter and pattern progress should live. For the
          MVP, users need a fast way to resume active work.
        </Text>
      </View>

      {projects.map((project) => (
        <View
          key={project.name}
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
          <Text selectable style={{ fontSize: 18, fontWeight: "600" }}>
            {project.name}
          </Text>
          <Text selectable style={{ color: "#007AFF", fontWeight: "600" }}>
            {project.status}
          </Text>
          <Text
            selectable
            style={{ color: "#636366", lineHeight: 20, fontVariant: ["tabular-nums"] }}
          >
            {project.progress}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
