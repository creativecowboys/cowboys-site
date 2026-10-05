import type { Metadata } from "next";
import WebDesignCityPage from "@/components/WebDesignCityPage";
import { carrolltonWebDesign, webDesignCityMetadata } from "@/lib/web-design-cities";

export const metadata: Metadata = webDesignCityMetadata(carrolltonWebDesign);

export default function WebDesignCarrolltonPage() {
  return <WebDesignCityPage city={carrolltonWebDesign} />;
}
