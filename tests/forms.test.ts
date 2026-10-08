import { describe, expect, it } from "vitest";
import {
  blankResponse,
  generateUniqueId,
  initializeField,
  parseForms,
  validateField,
} from "../lib/forms";
const field = (type: Parameters<typeof initializeField>[0], required = true) =>
  initializeField(type, "Champ", required, -10, 10, [
    { id: 1, value: "Oui" },
    { id: 2, value: "Non" },
  ]);
describe("validation des réponses", () => {
  it("génère des identifiants uniques même dans une rafale", () => {
    const ids = Array.from({ length: 3000 }, generateUniqueId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Number.isSafeInteger)).toBe(true);
  });
  it("rejette les options incohérentes et les erreurs non textuelles", () => {
    const wrap = (field: unknown) =>
      JSON.stringify([{ id: 1, formName: "Test", fields: [field] }]);
    expect(() =>
      parseForms(wrap({ ...field("text"), errorMessage: { injected: true } })),
    ).toThrow();
    expect(() =>
      parseForms(wrap({ ...field("select"), options: [] })),
    ).toThrow();
    expect(() =>
      parseForms(wrap({ ...field("number"), min: 10, max: -10 })),
    ).toThrow();
    expect(() =>
      parseForms(
        wrap({
          ...field("checkbox"),
          options: [
            { id: 1, value: "Oui" },
            { id: 1, value: "Non" },
          ],
        }),
      ),
    ).toThrow();
  });
  it("accepte zéro et contrôle les bornes des nombres", () => {
    expect(validateField({ ...field("number"), value: 0 })).toBeNull();
    expect(validateField({ ...field("number"), value: 11 })).toContain(
      "maximale",
    );
    expect(validateField({ ...field("number"), value: -11 })).toContain(
      "minimale",
    );
    expect(validateField({ ...field("number"), value: "abc" })).toContain(
      "nombre",
    );
  });
  it("valide une sélection réelle pour une case obligatoire", () => {
    expect(validateField({ ...field("checkbox"), value: [] })).toContain(
      "obligatoire",
    );
    expect(validateField({ ...field("checkbox"), value: ["Oui"] })).toBeNull();
    expect(validateField({ ...field("checkbox"), value: ["Autre"] })).toContain(
      "option",
    );
  });
  it("valide les emails facultatifs et les espaces", () => {
    expect(validateField({ ...field("email", false), value: "" })).toBeNull();
    expect(
      validateField({ ...field("email", false), value: "incorrect" }),
    ).toContain("email");
    expect(validateField({ ...field("text"), value: "   " })).toContain(
      "obligatoire",
    );
  });
  it("isole une nouvelle réponse et conserve la casse des options", () => {
    const original = {
      id: 1,
      formName: "Contact",
      fields: [{ ...field("checkbox"), value: ["Oui"] }],
    };
    const response = blankResponse(original);
    expect(response.fields[0].value).toEqual([]);
    response.fields[0].options![0].value = "Modifiée";
    expect(original.fields[0].options![0].value).toBe("Oui");
  });
  it("refuse les données corrompues et les champs aux identifiants dupliqués", () => {
    expect(() => parseForms("{")).toThrow();
    expect(() => parseForms('[{"id":1}]')).toThrow();
    const f = field("text");
    expect(() =>
      parseForms(JSON.stringify([{ id: 1, formName: "Test", fields: [f, f] }])),
    ).toThrow();
    expect(parseForms(null)).toEqual([]);
  });
});
