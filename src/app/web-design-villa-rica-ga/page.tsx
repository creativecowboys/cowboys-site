import type { Metadata } from "next";
import WebDesignCityPage from "@/components/WebDesignCityPage";
import { villaRicaWebDesign, webDesignCityMetadata } from "@/lib/web-design-cities";

export const metadata: Metadata = webDesignCityMetadata(villaRicaWebDesign);

export default function WebDesignVillaRicaPage() {
  return <WebDesignCityPage city={villaRicaWebDesign} />;
}
