"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type ServiceSection = {
  id: string;
  itemIds: string[];
};

/** Иконки: `often` — самые заказываемые; `middle` / `rare` — отдельные наборы. */
const SERVICE_ITEM_ICONS: Record<string, string> = {
  targetedMetaVkTiktok: "/often/trend-up.svg",
  contextGoogleYandex: "/often/search-normal.svg",
  seoPromotion: "/often/gps.svg",
  corporateWebsite: "/often/monitor-mobbile.svg",
  smmManagement: "/often/mobile.svg",
  adCreatives: "/often/colors-square.svg",
  copywriting: "/often/edit.svg",
  analyticsSetup: "/often/chart-2.svg",
  emailMarketing: "/often/mobile.svg",

  websiteRedesign: "/middle/designtools.svg",
  uxUiDesign: "/middle/magicpen.svg",
  abTesting: "/middle/note-2.svg",
  marketplacePromotion: "/middle/bag-happy.svg",
  onlineStoreCreation: "/middle/shopping-cart.svg",
  influencerAds: "/middle/user-search.svg",
  videoProduction: "/middle/video-play.svg",
  crmAutomation: "/middle/setting-2.svg",
  localSeo: "/middle/location.svg",

  logoDesign: "/rare/brush-4.svg",
  brandIdentity: "/rare/lamp-on.svg",
  prPublications: "/rare/clipboard.svg",
  brandbook: "/rare/menu-board.svg",
  marketingResearch: "/rare/message-question.svg",
  businessPhotography: "/rare/camera.svg",
  presentationDesign: "/rare/ruler%26pen.svg",
  chatbots: "/rare/device-message.svg",
  quizLandingPages: "/rare/notification-status.svg",
};

function serviceIconSrc(itemId: string): string {
  return SERVICE_ITEM_ICONS[itemId] ?? "/often/edit.svg";
}

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
                      className={`flex min-h-[112px] min-w-0 flex-col items-start gap-3 rounded-2xl px-6 py-4 transition-all duration-300 ease-out will-change-transform hover:scale-[1.03] hover:shadow-md md:min-h-16 md:flex-row md:items-center md:gap-3 md:rounded-full ${
                        isActive
                          ? "bg-[#9ab5f6] text-[var(--services-title)] hover:bg-[#8aa4ef] dark:hover:bg-[#aab9f8]"
                          : "bg-[var(--services-text-bg)] text-[var(--services-title)] hover:bg-zinc-100 hover:ring-2 hover:ring-[var(--design-btn)]/20 dark:hover:bg-[#a1a1aa] dark:hover:ring-[var(--design-btn)]/35"
                      }`}
                    >
                      <img
                        src={serviceIconSrc(itemId)}
                        alt=""
                        width={20}
                        height={20}
                        className="h-4 w-4 flex-shrink-0 object-contain md:h-5 md:w-5"
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