import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Validate the incoming locale
  let validatedLocale = locale;

  if (!validatedLocale || !routing.locales.includes(validatedLocale as "de" | "en")) {
    validatedLocale = routing.defaultLocale;
  }

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default,
  };
});
