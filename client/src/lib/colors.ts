// ATMF Design System Color Constants

// Backgrounds
export const COLORS = {
  // Main backgrounds
  bgMain: "#0a1022", // Dark blue main background
  bgDark: "#050914", // Darker panels background
  bgCard: "#0e1529", // Card background
  
  // Neon accent colors
  neonBlue: "#2E75FF", // Primary neon blue for highlights, selected tabs, etc.
  neonPurple: "#8A56FF", // Secondary neon purple for indicators
  neonTeal: "#2FFFDD", // Third neon teal for metrics
  
  // State colors
  success: "#2FFFAA", // Green for success states
  warning: "#FFBB3A", // Yellow for warning states
  danger: "#FF4A6B", // Red for danger/error states
  
  // Text colors
  textPrimary: "#FFFFFF", // White for primary text
  textSecondary: "rgba(255, 255, 255, 0.7)", // Semi-transparent white for secondary text
  textMuted: "rgba(255, 255, 255, 0.5)", // More transparent white for muted text
  
  // Button colors
  buttonPrimary: "#1a2b4a", // Mid-dark blue for primary buttons
  buttonLink: "#2E75FF", // Neon blue for link text
  
  // Misc
  border: "rgba(255, 255, 255, 0.1)", // Semi-transparent white for borders
  divider: "rgba(255, 255, 255, 0.06)", // Subtle divider color
};

// Opacity levels for glassmorphism
export const OPACITY = {
  glass: "0.08", // For glassmorphism panels
  glassHover: "0.12", // For hovering glassmorphism
  cardBg: "0.1", // For card backgrounds
  overlay: "0.7", // For overlays (modals, etc.)
};

// Gradient definitions
export const GRADIENTS = {
  blueGradient: "linear-gradient(to right, rgba(46, 117, 255, 0.8), rgba(46, 117, 255, 0.4))",
  purpleGradient: "linear-gradient(to right, rgba(138, 86, 255, 0.8), rgba(138, 86, 255, 0.4))",
  tealGradient: "linear-gradient(to right, rgba(47, 255, 221, 0.8), rgba(47, 255, 221, 0.4))",
  multiGradient: "linear-gradient(to right, rgba(46, 117, 255, 0.8), rgba(138, 86, 255, 0.4))",
};

// Shadow definitions
export const SHADOWS = {
  neonBlueShadow: "0 0 10px rgba(46, 117, 255, 0.5), 0 0 20px rgba(46, 117, 255, 0.3)",
  neonPurpleShadow: "0 0 10px rgba(138, 86, 255, 0.5), 0 0 20px rgba(138, 86, 255, 0.3)",
  neonTealShadow: "0 0 10px rgba(47, 255, 221, 0.5), 0 0 20px rgba(47, 255, 221, 0.3)",
  cardShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
};