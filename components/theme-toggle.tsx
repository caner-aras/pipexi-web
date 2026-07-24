"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <Sun className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9">
            {resolvedTheme === "dark" ? (
              <Moon className="size-4 text-primary" />
            ) : (
              <Sun className="size-4 text-amber-500" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <SelectThemeContent setTheme={setTheme} />
    </DropdownMenu>
  );
}

function SelectThemeContent({ setTheme }: { setTheme: (theme: string) => void }) {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="mr-2 size-4" />
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Moon className="mr-2 size-4" />
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <span className="mr-2 text-xs font-semibold">SYS</span>
        System
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
