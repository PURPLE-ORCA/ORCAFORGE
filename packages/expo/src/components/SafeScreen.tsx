import { View, type ViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type SafeArea = "top" | "bottom" | "both" | "none";

export interface SafeScreenProps extends ViewProps {
  children: React.ReactNode;
  /** Toggles between a static view and a ScrollView */
  scrollable?: boolean;
  /** Controls which safe areas to pad */
  safeArea?: SafeArea;
  /** Tailwind classes applied to the outer container */
  className?: string;
  /** Tailwind classes applied to the inner content container */
  contentClassName?: string;
}

const safeStyles: Record<SafeArea, string> = {
  top: "pt-safe-offset-1 pb-safe-offset-4",
  bottom: "pt-2 pb-safe-offset-24",
  both: "pt-safe-offset-1 pb-safe-offset-24",
  none: "pt-2 pb-safe-offset-4",
};

/**
 * Modern mobile screen wrapper using native keyboard controllers.
 * Zero JS touch-listener overhead. Native frame tracking.
 */
export function SafeScreen({
  children,
  scrollable = false,
  safeArea = "top",
  className = "",
  contentClassName = "",
  ...props
}: SafeScreenProps) {
  const safeAreaClasses = safeStyles[safeArea];

  return (
    <View className={`flex-1 bg-background ${className}`} {...props}>
      <KeyboardAwareScrollView
        // If it's static, we disable scrolling but keep the native keyboard padding
        scrollEnabled={scrollable}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-safe"
        contentContainerClassName={`grow ${safeAreaClasses} ${contentClassName}`}
        // Let the native layer handle tap-to-dismiss without blocking button presses
        keyboardShouldPersistTaps="handled"
        // Smooth native padding
        bottomOffset={20}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}
