import type {Metadata} from "next";
import "./globals.css";
import {BackgroundWave} from "@/components/background-wave";

export const metadata: Metadata = {
    title: "HR Interview Bot",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={"h-full w-full"}>
        <body className={`antialiased w-full h-full flex flex-col`}>
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
            {children}
            <BackgroundWave/>
        </div>
        </body>
        </html>
    );
}
