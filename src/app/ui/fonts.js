import { Barlow_Condensed, Inter, Habibi, Domine } from "next/font/google";

export const barlow = Barlow_Condensed({
    subsets: ["latin"],
    weight: ["400", "500", "600", "800"],
    variable: "--font-barlow",
})

export const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
})

export const habibi = Habibi({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-habibi",
})

export const domine = Domine({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-domine",
})