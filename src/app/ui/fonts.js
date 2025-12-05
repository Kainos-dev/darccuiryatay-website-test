import { Barlow_Condensed, Inter } from "next/font/google";

export const barlow = Barlow_Condensed({
    subsets: ["latin"],
    weight: ["400", "600", "800"],
    variable: "--font-barlow",
})

export const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
})