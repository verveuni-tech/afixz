import ServiceCategorySection from "./ServiceCategorySection";
import { homepageFallbackContent } from "../../lib/homepageFallbackContent";

export default function CleaningSection() {
  return (
    <ServiceCategorySection
      content={homepageFallbackContent.sections.cleaning}
      sectionKey="cleaning"
      backgroundClassName="bg-slate-50"
    />
  );
}
