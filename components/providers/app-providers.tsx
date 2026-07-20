"use client";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "var(--color-card)",
              color: "var(--color-card-foreground)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-elevated)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#6D4AFF", secondary: "#fff" } },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}
