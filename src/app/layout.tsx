// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Cost Estimator",
  description: "Client cost estimation portal",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
