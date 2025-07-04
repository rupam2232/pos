import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "next-themes";

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };
  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="relative"
      >
        <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:-rotate-0" />
        <span className="sr-only">Toggle Theme</span>
      </Button>
    </div>
  );
};

export default ToggleTheme;
