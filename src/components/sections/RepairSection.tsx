import ServiceCategorySection from "./ServiceCategorySection";
import { homepageFallbackContent } from "../../lib/homepageFallbackContent";

export default function RepairSection() {
  return (
    <ServiceCategorySection
      content={homepageFallbackContent.sections.repair}
      sectionKey="repair"
      backgroundClassName="bg-white"
    />
  );
}
