export const theme = {
  colors: {
    primary: "#2F6B5A",
    background: "#F7F4EE",
    surface: "#FFFFFF",

    textPrimary: "rgba(0, 0, 0, 0.92)",
    textSecondary: "rgba(0, 0, 0, 0.58)",
    textTertiary: "rgba(0, 0, 0, 0.32)",

    border: "rgba(0, 0, 0, 0.08)",
    borderStrong: "rgba(0, 0, 0, 0.14)",
    muted: "rgba(0, 0, 0, 0.04)",

    white: "#FFFFFF",
    whiteSoft: "rgba(255, 255, 255, 0.78)",
    whiteBorder: "rgba(255, 255, 255, 0.24)",

    primarySoft: "rgba(47, 107, 90, 0.12)",
    primaryBorder: "rgba(47, 107, 90, 0.22)",

    error: "#B42318",
    success: "#157F3B",
  },

  size: {
    tiny: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },

  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
} as const;

export type AppTheme = typeof theme;

export const Colors = theme.colors;
export const Spacing = theme.spacing;

export const Typography = {
  title: {
    fontSize: theme.size["2xl"],
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.size.xl,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.regular,
    color: theme.colors.textPrimary,
  },
  caption: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.regular,
    color: theme.colors.textSecondary,
  },
} as const;
