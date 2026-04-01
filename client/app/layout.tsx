import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets: ["latin"], variable: "--font-sans"});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "PM System - Project Management",
    description: "Hệ thống quản lý dự án",
    icons: {
        icon: "/images/favicon-white.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
            <body className="min-h-full flex flex-col">
                <AuthProvider>
                    {children}
                    <Toaster richColors position="top-right" closeButton />
                </AuthProvider>
            </body>
        </html>
    );
}
