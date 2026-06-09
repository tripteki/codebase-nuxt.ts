type TranslationNamespace = "auth" | "common";

type ScopedTranslation = (key: string) => string;

export function useTranslation (namespace: TranslationNamespace): {
    t: ScopedTranslation;
    locale: ReturnType<typeof useI18n>["locale"];
}
{
    const { t: translate, locale, } = useI18n ();

    const t: ScopedTranslation = (key: string): string =>
        translate (`${namespace}.${key}`);

    return { t, locale, };
}
