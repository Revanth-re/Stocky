"use client";
import { useStoreUsers, useUpdateUserRole } from "../api/use-users";
import { InviteUserDialog } from "./invite-user-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { initialsFromName } from "@/lib/utils";
import type { UserRole } from "@/db/schema";

export function UsersList() {
  const { data: users, isLoading } = useStoreUsers();
  const updateRole = useUpdateUserRole();

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Team members</CardTitle>
        <InviteUserDialog />
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="m-4 h-12" />)}
        {users?.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-4">
            <Avatar>
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {!user.isActive && <Badge variant="destructive">Inactive</Badge>}
            {user.role === "owner" ? (
              <Badge variant="outline" className="capitalize">Owner</Badge>
            ) : (
              <Select value={user.role} onValueChange={(role) => updateRole.mutate({ id: user.id, role: role as UserRole })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
