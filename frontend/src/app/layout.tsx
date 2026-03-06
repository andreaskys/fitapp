import "./globals.css";

export const metadata = {
    title: "Nutrition Clinic",
    description: "Minimalist clinic management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-white text-black min-h-screen">
        {children}
        </body>
        </html>
    );
}