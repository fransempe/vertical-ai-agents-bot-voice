import type {Metadata} from "next";
import "./globals.css";
import { DM_Sans, Nunito_Sans, Poppins, Share_Tech_Mono } from "next/font/google";

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-dm-sans",
    display: "swap",
});

const nunito = Nunito_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "600", "700", "800"],
    variable: "--font-nunito",
    display: "swap",
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["200", "300", "400"],
    variable: "--font-poppins",
    display: "swap",
});

const shareTechMono = Share_Tech_Mono({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-share-tech-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "HR Interview Bot",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
    <html lang="en" className={`h-full w-full ${dmSans.variable} ${nunito.variable} ${poppins.variable} ${shareTechMono.variable}`}>
        <body className={`antialiased w-full h-full flex flex-col`} suppressHydrationWarning>
        <div className="flex flex-col flex-grow w-full items-center justify-center">
            {children}
        </div>
        </body>
        </html>
    );
}
