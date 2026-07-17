"use client";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Kirana AI looks on your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors",
                theme === value ? "border-primary bg-accent" : "border-border",
              )}
            >
              {theme === value && <Check className="absolute right-2 top-2 size-4 text-primary" />}
              <Icon className="size-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
