import ServiceCategorySection from "./ServiceCategorySection";
import { homepageFallbackContent } from "../../lib/homepageFallbackContent";

export default function BeautySection() {
  return (
    <ServiceCategorySection
      content={homepageFallbackContent.sections.beauty}
      sectionKey="beauty"
      backgroundClassName="bg-rose-50/50"
    />
  );
}
