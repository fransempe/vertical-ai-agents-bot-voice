import type {Metadata} from "next";
import "./globals.css";
import {BackgroundWave} from "@/components/background-wave";
import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "HR Interview Bot",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
    <html lang="en" className={`h-full w-full ${inter.variable}`}>
        <body className={`antialiased w-full h-full flex flex-col font-sans`}>
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
            {children}
        </div>
        </body>
        </html>
    );
}
