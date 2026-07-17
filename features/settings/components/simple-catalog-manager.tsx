"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SimpleCatalogManager({
  title,
  items,
  isLoading,
  isSaving,
  onAdd,
}: {
  title: string;
  items?: { id: string; name: string }[];
  isLoading: boolean;
  isSaving: boolean;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAdd(name.trim());
            setName("");
          }}
        >
          <Input placeholder={`Add a new ${title.toLowerCase().replace(/s$/, "")}…`} value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" loading={isSaving}>
            <Plus className="size-4" /> Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
          {items?.map((item) => (
            <span key={item.id} className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm">
              {item.name}
            </span>
          ))}
          {!isLoading && items?.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
