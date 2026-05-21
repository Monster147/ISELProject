export const getLabelByLanguage = (
    labelOrTitle: string | { pt: string; en: string; es: string } | undefined,
    currentLanguage: string
): string => {
    if (!labelOrTitle) return "";

    if (typeof labelOrTitle === "string") {
        return labelOrTitle
    }

    if (typeof labelOrTitle === "object") {
        const languageMap: Record<string, keyof typeof labelOrTitle> = {
            pt: "pt",
            en: "en",
            es: "es",
            "pt-PT": "pt",
            "pt-BR": "pt",
            "en-US": "en",
            "en-GB": "en",
            "es-ES": "es",
            "es-MX": "es",
        }

        const key = languageMap[currentLanguage] ?? "en"

        return labelOrTitle[key]
    }

    return "";
};