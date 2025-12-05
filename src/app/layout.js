import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import { barlow, inter } from "./ui/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <AuthProvider>
          <Toaster richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
