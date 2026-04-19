import type { Metadata } from "next";
import { ContadorInicio } from "./ContadorInicio";

export const metadata: Metadata = {
  title: "Everton David",
  description: "Everton David",
};

export default function Home() {
  return <ContadorInicio />;
}
