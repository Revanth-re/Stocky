"use client";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
      <SelectTrigger className="h-9 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none" aria-label={t("common.language")}>
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
