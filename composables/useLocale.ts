import { ref, watch, type Ref, } from "vue";

export type LocaleType = {
    availableLocales: readonly string[];
    currentLocale: Ref<string>;
    setCurrentLocale: (locale: string) => void;
};

export function useLocale (): LocaleType
{
    const { locale, locales, setLocale, } = useI18n ();

    const currentLocale = ref<string> (String (locale.value || "en"));

    watch (locale, (value: string): void =>
    {
        currentLocale.value = value;
    });

    function setCurrentLocale (nextLocale: string): void
    {
        setLocale (nextLocale as "en" | "id" | "ms");
    }

    const availableLocales = (locales.value as Array<{ code: string; }>).map ((item) => item.code);

    return {
        availableLocales,
        currentLocale,
        setCurrentLocale,
    };
}

export function useTranslations (
    namespaces: Array<"auth" | "common">
): Record<string, ReturnType<typeof useTranslation>>
{
    return namespaces.reduce<Record<string, ReturnType<typeof useTranslation>>> ((translations, namespace) =>
    {
        translations[namespace] = useTranslation (namespace);

        return translations;
    }, {});
}
