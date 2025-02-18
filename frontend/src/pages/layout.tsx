import React from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const pathname = location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);

    // Budujemy breadcrumbsy, zaczynając od głównej strony (Dashboard)
    const breadcrumbs = [
        {
            href: "/",
            label: "Dashboard",
        },
        ...pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            // Zamieniamy myślniki na spacje i ustalamy wielką literę
            const label = decodeURIComponent(segment).replace(/-/g, " ");
            return {
                href,
                label: label.charAt(0).toUpperCase() + label.slice(1),
            };
        }),
    ];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 h-9 w-9" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => {
                                    const isLast =
                                        index === breadcrumbs.length - 1;
                                    return (
                                        <React.Fragment key={breadcrumb.href}>
                                            <BreadcrumbItem className="hidden md:block">
                                                {isLast ? (
                                                    <BreadcrumbPage>
                                                        {breadcrumb.label}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink
                                                        href={breadcrumb.href}>
                                                        {breadcrumb.label}
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {!isLast && (
                                                <BreadcrumbSeparator className="hidden md:block" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="px-4">
                        <ModeToggle />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}

