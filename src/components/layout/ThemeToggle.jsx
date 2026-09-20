import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative overflow-hidden"
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
    </Button>
  );
}
