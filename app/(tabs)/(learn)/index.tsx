import { theme } from "@/constants/Theme";
import { lessons as lessonsTable, type Lesson } from "@/db/schema";
import { useDbStore } from "@/stores/dbStore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function LearnScreen() {
  const { db } = useDbStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLessons() {
      if (!db) return;

      setIsLoading(true);

      try {
        const result = await db
          .select()
          .from(lessonsTable)
          .orderBy(lessonsTable.sortOrder);

        if (isMounted) {
          setLessons(result);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLessons();

    return () => {
      isMounted = false;
    };
  }, [db]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 20,
        gap: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          selectable
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: theme.colors.textPrimary,
          }}
        >
          Beginner path
        </Text>
        <Text
          selectable
          style={{
            fontSize: 16,
            lineHeight: 22,
            color: theme.colors.textSecondary,
          }}
        >
          Keep the MVP focused on a short sequence of lessons that gets someone
          from zero to their first finished project.
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{
            paddingVertical: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {lessons.map((lesson, index) => (
        <View
          key={lesson.title}
          style={{
            padding: 18,
            borderRadius: 20,
            borderCurve: "continuous",
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: 6,
          }}
        >
          <Text
            selectable
            style={{ fontSize: 14, color: theme.colors.textSecondary }}
          >
            Lesson {index + 1}
          </Text>
          <Text
            selectable
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.colors.textPrimary,
            }}
          >
            {lesson.title}
          </Text>
          <Text
            selectable
            style={{ color: theme.colors.textSecondary, lineHeight: 20 }}
          >
            {lesson.description}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
