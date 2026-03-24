import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru" , "fr", "ar", "de"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  // routingStrategy: "hash",
  // directory: "app/i18n",
  // path: "app/i18n",
  // localeDetection: false,
});

