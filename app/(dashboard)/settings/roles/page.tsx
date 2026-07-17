import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/rbac";

export const metadata: Metadata = { title: "Roles & Permissions" };

const ROLES = ["owner", "manager", "employee"] as const;

export default function RolesSettingsPage() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
        <CardDescription>
          Default permission matrix for each role. Owners always have full access.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {ROLES.map((role) => (
                <TableHead key={role} className="text-center capitalize">{role}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableCell className="font-mono text-xs">{permission}</TableCell>
                {ROLES.map((role) => (
                  <TableCell key={role} className="text-center">
                    {DEFAULT_ROLE_PERMISSIONS[role].includes(permission) ? (
                      <Check className="mx-auto size-4 text-success" />
                    ) : (
                      <X className="mx-auto size-4 text-muted-foreground/40" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
