"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/validators/auth";
import { useUpdateProfile } from "../api/use-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { initialsFromName } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";

export function ProfileForm({ user }: { user: SessionUser }) {
  const updateProfile = useUpdateProfile();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name, phone: "", avatarUrl: user.avatarUrl ?? "" },
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="text-lg">{initialsFromName(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">{user.role}</Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={updateProfile.isPending}>
              Save changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
