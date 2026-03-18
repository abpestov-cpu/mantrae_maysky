import { browser } from "$app/environment";
import { init, register, getLocaleFromNavigator, locale } from "svelte-i18n";

register("en", () => import("./locales/en.json"));
register("ru", () => import("./locales/ru.json"));

const defaultLocale = "en";
const storedLocale = browser ? localStorage.getItem("locale") : null;

init({
	fallbackLocale: defaultLocale,
	initialLocale: storedLocale || (browser ? getLocaleFromNavigator()?.split("-")[0] : defaultLocale),
});

// Persist locale changes to localStorage
if (browser) {
	locale.subscribe((value) => {
		if (value) {
			localStorage.setItem("locale", value);
			document.documentElement.lang = value;
		}
	});
}

export { locale } from "svelte-i18n";
export { t, _ } from "svelte-i18n";
