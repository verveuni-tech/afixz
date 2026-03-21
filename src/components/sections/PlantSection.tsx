import ServiceCategorySection from "./ServiceCategorySection";
import { homepageFallbackContent } from "../../lib/homepageFallbackContent";

export default function PlantSection() {
  return (
    <ServiceCategorySection
      content={homepageFallbackContent.sections.gardening}
      sectionKey="gardening"
      backgroundClassName="bg-emerald-50/40"
    />
  );
}
