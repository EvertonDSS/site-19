import type { Metadata } from "next";
import { ContadorInicio } from "./ContadorInicio";

export const metadata: Metadata = {
  title: "Aniversário",
  description: "Contagem regressiva até 19 de abril de 2026",
};

export default function Home() {
  return <ContadorInicio />;
}
