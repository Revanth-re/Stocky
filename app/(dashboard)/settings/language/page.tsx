"use client";
import { useState } from "react";
import { useSaveSetting } from "@/features/settings/api/use-app-setting";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "mr", label: "मराठी (Marathi)" },
];

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState("en");
  const saveSetting = useSaveSetting("language");

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Language</CardTitle>
        <CardDescription>Choose the display language for your store dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="max-w-xs space-y-2">
        <Label>Display language</Label>
        <Select
          value={language}
          onValueChange={(value) => {
            setLanguage(value);
            saveSetting.mutate({ key: "locale", value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
