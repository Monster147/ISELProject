/**
 * Obtém o valor de um label ou título para a linguagem ativa do utilizador.
 *
 * Suporta tanto strings simples como objetos com traduções para português, inglês e espanhol.
 * Trata também variantes regionais (ex: `"pt-BR"` → `"pt"`, `"en-US"` → `"en"`).
 * Em caso de linguagem não suportada, usa inglês como fallback.
 *
 * @param labelOrTitle String simples, objeto de traduções `{ pt, en, es }`, ou `undefined`.
 * @param currentLanguage Código da linguagem ativa (ex: `"pt"`, `"en-US"`, `"es-ES"`).
 * @returns String na linguagem indicada, ou string vazia se o valor for `undefined`.
 */
export const getLabelByLanguage = (
  labelOrTitle: string | { pt: string; en: string; es: string } | undefined,
  currentLanguage: string,
): string => {
  if (!labelOrTitle) return "";

  if (typeof labelOrTitle === "string") {
    return labelOrTitle;
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
    };

    const key = languageMap[currentLanguage] ?? "en";

    return labelOrTitle[key];
  }

  return "";
};
