import type { Metadata } from "next";
import WebDesignCityPage from "@/components/WebDesignCityPage";
import { douglasvilleWebDesign, webDesignCityMetadata } from "@/lib/web-design-cities";

export const metadata: Metadata = webDesignCityMetadata(douglasvilleWebDesign);

export default function WebDesignDouglasvillePage() {
  return <WebDesignCityPage city={douglasvilleWebDesign} />;
}
