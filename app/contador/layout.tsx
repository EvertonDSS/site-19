import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contador",
  description: "Contagem regressiva até 19 de abril de 2026",
};

export default function ContadorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
