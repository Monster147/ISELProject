import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

const labels = { pt: "Olá", en: "Hello", es: "Hola" };

describe("getLabelByLanguage", () => {
  it("returns a plain string label unchanged", () => {
    expect(getLabelByLanguage("Plain", "pt")).toBe("Plain");
  });

  it("returns an empty string for undefined input", () => {
    expect(getLabelByLanguage(undefined, "pt")).toBe("");
  });

  it("picks the matching language for an exact code", () => {
    expect(getLabelByLanguage(labels, "pt")).toBe("Olá");
    expect(getLabelByLanguage(labels, "en")).toBe("Hello");
    expect(getLabelByLanguage(labels, "es")).toBe("Hola");
  });

  it("maps regional codes to the base language", () => {
    expect(getLabelByLanguage(labels, "pt-BR")).toBe("Olá");
    expect(getLabelByLanguage(labels, "en-GB")).toBe("Hello");
    expect(getLabelByLanguage(labels, "es-MX")).toBe("Hola");
  });

  it("falls back to English for an unknown language code", () => {
    expect(getLabelByLanguage(labels, "fr")).toBe("Hello");
  });
});
