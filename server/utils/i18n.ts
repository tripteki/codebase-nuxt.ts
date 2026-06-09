import { readFileSync, } from "node:fs";
import { resolve, } from "node:path";

type TranslationObject = Record<string, any>;

const translationsCache: Record<string, TranslationObject> = {};

const getTranslationFile = (
    locale: string,
    namespace: string
): TranslationObject =>
{
    const cacheKey = `${locale}:${namespace}`;

    if (translationsCache[cacheKey])
    {
        return translationsCache[cacheKey];
    }

    try
    {
        const filePath = resolve (process.cwd (), "lang", locale, `${namespace}.json`);
        const fileContent = readFileSync (filePath, "utf-8");
        const translations = JSON.parse (fileContent) as TranslationObject;
        const resolved = translations[namespace] ?? translations;

        translationsCache[cacheKey] = resolved;

        return resolved;
    }
    catch (error)
    {
        console.error (`Failed to load translation file: ${locale}/${namespace}.json`, error);
        return {};
    }
};

export const getServerTranslation = (
    locale: string = "en",
    namespace: string = "common"
): ((key: string) => string) =>
{
    const translations = getTranslationFile (locale, namespace);

    return (key: string): string =>
    {
        const keys = key.split (".");
        let value: any = translations;

        for (const k of keys)
        {
            if (value && typeof value === "object" && k in value)
            {
                value = value[k];
            }
            else
            {
                return key;
            }
        }

        return typeof value === "string" ? value : key;
    };
};

export const getLocaleFromEvent = (event: any): string =>
{
    const supportedLocales = [ "en", "id", "ms", ];
    const cookieLocale = getCookie (event, "i18n_redirected");

    if (cookieLocale && supportedLocales.includes (cookieLocale))
    {
        return cookieLocale;
    }

    const locale = getHeader (event, "accept-language")?.split (",")?.[0]?.split ("-")?.[0] || "en";

    return supportedLocales.includes (locale) ? locale : "en";
};
