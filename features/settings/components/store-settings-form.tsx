"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeProfileSchema, type StoreProfileInput } from "@/validators/settings";
import { useStoreProfile, useUpdateStoreProfile } from "../api/use-store-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function StoreSettingsForm() {
  const { data: store, isLoading } = useStoreProfile();
  const updateStore = useUpdateStoreProfile();
  const form = useForm<StoreProfileInput>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: { name: "", ownerName: "", phone: "", gstNumber: "", address: "" },
  });

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        ownerName: store.ownerName,
        phone: store.phone,
        gstNumber: store.gstNumber ?? "",
        address: store.address ?? "",
        storeType: store.storeType,
      });
    }
  }, [store, form]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Store details</CardTitle>
        <CardDescription>This information appears on invoices and purchase orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => updateStore.mutate(values))} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Store name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ownerName" render={({ field }) => (
                <FormItem><FormLabel>Owner name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gstNumber" render={({ field }) => (
                <FormItem><FormLabel>GST number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" loading={updateStore.isPending}>Save changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
