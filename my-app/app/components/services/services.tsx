"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type ServiceSection = {
  id: string;
  itemIds: string[];
};

const sections: ServiceSection[] = [
  {
    id: "popular",
    itemIds: [
      "targetedMetaVkTiktok",
      "contextGoogleYandex",
      "seoPromotion",
      "corporateWebsite",
      "smmManagement",
      "adCreatives",
      "copywriting",
      "analyticsSetup",
      "emailMarketing",
    ],
  },
  {
    id: "middle",
    itemIds: [
      "websiteRedesign",
      "uxUiDesign",
      "abTesting",
      "marketplacePromotion",
      "onlineStoreCreation",
      "influencerAds",
      "videoProduction",
      "crmAutomation",
      "localSeo",
    ],
  },
  {
    id: "rare",
    itemIds: [
      "logoDesign",
      "brandIdentity",
      "prPublications",
      "brandbook",
      "marketingResearch",
      "businessPhotography",
      "presentationDesign",
      "chatbots",
      "quizLandingPages",
    ],
  },
];

export default function Services() {
  const t = useTranslations("servicesSection");
  const [openedSection, setOpenedSection] = useState<string>("popular");

  return (
    <section className="mt-6 px-3 py-6 md:px-6 md:py-8 lg:px-8">
      <h2 className="mb-8 text-center text-2xl font-bold text-[var(--services-title)] md:mb-10 md:text-3xl">
        {t("title")}
      </h2>

      <div className="space-y-4 md:space-y-8">
        {sections.map((section) => {
          const isOpenMobile = openedSection === section.id;

          return (
            <div key={section.id} className="rounded-2xl bg-[var(--services-bg)] p-2 md:p-3 ">
              <button
                type="button"
                onClick={() =>
                  setOpenedSection((prev) => (prev === section.id ? "" : section.id))
                }
                className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-left md:pointer-events-none md:justify-center"
                aria-expanded={isOpenMobile}
              >
                <span className="text-1xl font-semibold text-[var(--services-title)] md:text-2xl mb-2">
                  {t(`sections.${section.id}.title`)}
                </span>
                <span className="text-xl text-zinc-500 md:hidden">
                  {isOpenMobile ? "⌃" : "⌄"}
                </span>
              </button>

              <div
                className={`mt-2 grid grid-cols-2 gap-2  pb-6 md:grid md:grid-cols-3 md:gap-3 ${
                  isOpenMobile ? "block" : "hidden"
                } md:block`}
              >
                {section.itemIds.map((itemId, index) => {
                  const isActive = section.id === "popular" && index === 0;

                  return (
                    <div
                      key={`${section.id}-${itemId}`}
                      className={`flex min-h-[112px] min-w-0 flex-col items-start gap-2 rounded-2xl px-3 py-4 md:min-h-16 md:flex-row md:items-center md:gap-2 md:rounded-full ${
                        isActive
                          ? "bg-[#9ab5f6] text-[var(--services-title)]"
                          : "bg-[var(--services-text-bg)]  text-[var(--services-title)]"
                      }`}
                    >
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-zinc-400"
                        aria-hidden
                      />
                      <span className="min-w-0 w-full text-xs leading-5 md:text-sm">
                        {t(`sections.${section.id}.items.${itemId}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}