import { describe, expect, it } from "vitest";
import {
  answersCsv,
  cloneField,
  cloneForm,
  createTemplate,
  filterAnswers,
  summarizeAnswers,
  templates,
} from "../lib/productivity";
import { isFormData } from "../lib/forms";
describe("outils de conception et résultats", () => {
  it("produit des modèles valides avec identités indépendantes et zéro réponse", () => {
    for (const template of templates) {
      const first = createTemplate(template.id);
      const second = createTemplate(template.id);
      expect(isFormData(first)).toBe(true);
      expect(first.id).not.toBe(second.id);
      expect(first.fields.map((field) => field.id)).not.toEqual(
        second.fields.map((field) => field.id),
      );
      expect(
        first.fields.every(
          (field) =>
            field.fieldType === "range" ||
            field.value === "" ||
            (Array.isArray(field.value) && field.value.length === 0),
        ),
      ).toBe(true);
    }
  });
  it("ne transporte ni réponses ni références lors de la duplication", () => {
    const source = createTemplate("event");
    source.fields[0].value = "Alice";
    source.fields[4].value = ["Matin"];
    const cloned = cloneForm(source);
    expect(cloned.id).not.toBe(source.id);
    expect(cloned.fields[0].value).toBe("");
    expect(cloned.fields[4].value).toEqual([]);
    expect(cloned.fields[4].options![0].id).not.toBe(
      source.fields[4].options![0].id,
    );
    cloned.fields[4].options![0].value = "Modifié";
    expect(source.fields[4].options![0].value).toBe("Matin");
    const field = cloneField(source.fields[0]);
    expect(field.id).not.toBe(source.fields[0].id);
    expect(field.value).toBe("");
  });
  it("filtre les valeurs en conservant les positions de suppression réelles", () => {
    const first = createTemplate("contact");
    const second = createTemplate("feedback");
    second.fields[2].value = "TRÈS agréable";
    const found = filterAnswers([first, second], String(second.id), "agréable");
    expect(found).toEqual([{ answer: second, index: 1 }]);
    expect(
      filterAnswers([first, second], String(first.id), "agréable"),
    ).toEqual([]);
  });
  it("exporte les schémas successifs sans écraser un champ renommé et protège les formules", () => {
    const first = createTemplate("contact");
    first.fields[0].value = 'Alice;"bonjour"\nSeconde ligne';
    first.fields[3].value = '=HYPERLINK("https://example.com")';
    const next = structuredClone(first);
    next.fields[0].fieldName = "Nom modifié";
    next.fields[0].value = "\t@SUM(1)";
    const csv = answersCsv([first, next]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Votre prénom"');
    expect(csv).toContain('"Nom modifié"');
    expect(csv).toContain('Alice;""bonjour""\nSeconde ligne');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'\t@SUM(1)");
    expect(csv.split("\r\n")).toHaveLength(3);
  });
  it("calcule les moyennes avec zéro et ignore les nombres facultatifs vides", () => {
    const zero = createTemplate("feedback");
    zero.fields[0].value = 0;
    const ten = structuredClone(zero);
    ten.fields[0].value = 10;
    const empty = structuredClone(zero);
    empty.fields[0].value = "";
    expect(summarizeAnswers([zero, ten, empty])[0]).toMatchObject({
      average: 5,
      count: 2,
    });
  });
});
