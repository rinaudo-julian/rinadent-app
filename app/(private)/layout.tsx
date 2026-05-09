import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PrivateBreadcrumbs } from "@/components/private-breadcrumbs";
import { PrivateBreadcrumbsProvider } from "@/components/private-breadcrumbs-context";
import { PatientSearchCommand } from "@/components/patients/patient-search-command";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <PrivateBreadcrumbsProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <PrivateBreadcrumbs />
              <PatientSearchCommand />
            </div>
          </header>
          <main className="p-5">{children}</main>
        </SidebarInset>
      </PrivateBreadcrumbsProvider>
    </SidebarProvider>
  );
}
