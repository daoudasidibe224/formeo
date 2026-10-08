import {
  blankResponse,
  generateUniqueId,
  initializeField,
  type Field,
  type FormData,
} from "./forms";

export const templates = [
  {
    id: "contact",
    name: "Contact",
    description: "Coordonnées et demande en quatre champs.",
  },
  {
    id: "event",
    name: "Inscription à un événement",
    description: "Participants, créneau et préférences.",
  },
  {
    id: "feedback",
    name: "Retour d’expérience",
    description: "Une note et des retours concrets.",
  },
] as const;
export type TemplateId = (typeof templates)[number]["id"];

export function createTemplate(id: TemplateId): FormData {
  const make = (
    type: Field["fieldType"],
    name: string,
    required = true,
    options: string[] = [],
    min = 0,
    max = 100,
  ) =>
    initializeField(
      type,
      name,
      required,
      min,
      max,
      options.map((value) => ({ id: generateUniqueId(), value })),
    );
  const fields: Record<TemplateId, () => Field[]> = {
    contact: () => [
      make("text", "Votre prénom"),
      make("email", "Votre email"),
      make("select", "Sujet", true, ["Renseignement", "Projet", "Autre"]),
      make("textarea", "Votre demande"),
    ],
    event: () => [
      make("text", "Participant"),
      make("email", "Email de contact"),
      make("date", "Date souhaitée"),
      make("number", "Nombre de places", true, [], 1, 20),
      make("checkbox", "Préférences", false, ["Matin", "Après-midi", "Soir"]),
    ],
    feedback: () => [
      make("range", "Votre note", true, [], 0, 10),
      make("radio", "Recommanderiez-vous cette expérience ?", true, [
        "Oui",
        "Non",
      ]),
      make("textarea", "Ce qui vous a plu", false),
      make("textarea", "À améliorer", false),
    ],
  };
  return {
    id: generateUniqueId(),
    formName: templates.find((template) => template.id === id)!.name,
    fields: fields[id](),
  };
}

export function cloneField(field: Field): Field {
  const fresh = blankResponse({ id: 0, formName: "Copie", fields: [field] })
    .fields[0];
  return {
    ...fresh,
    id: generateUniqueId(),
    options: fresh.options?.map((option) => ({
      ...option,
      id: generateUniqueId(),
    })),
  };
}

export function cloneForm(form: FormData): FormData {
  return {
    id: generateUniqueId(),
    formName: `${form.formName} — copie`,
    fields: form.fields.map(cloneField),
  };
}

export function filterAnswers(
  answers: FormData[],
  formId: string,
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase("fr");
  return answers
    .map((answer, index) => ({ answer, index }))
    .filter(
      ({ answer }) =>
        (!formId || String(answer.id) === formId) &&
        (!normalized ||
          [
            answer.formName,
            ...answer.fields.map((field) =>
              Array.isArray(field.value)
                ? field.value.join(" ")
                : String(field.value),
            ),
          ].some((value) =>
            value.toLocaleLowerCase("fr").includes(normalized),
          )),
    );
}

function csvCell(value: string): string {
  // Quoting alone does not prevent spreadsheet formulas. Preserve their text.
  const safe =
    /^[\s\uFEFF]*[=+\-@]/u.test(value) || /^[\t\r\n]/u.test(value)
      ? `'${value}`
      : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function answersCsv(answers: FormData[]): string {
  const columns = new Map<string, string>();
  for (const answer of answers)
    for (const field of answer.fields) {
      const key = `${answer.id}:${field.id}:${field.fieldName}`;
      columns.set(key, field.fieldName);
    }
  const headers = ["Formulaire", "Réponse", ...columns.values()];
  const rows = answers.map((answer, index) => {
    const values = new Map(
      answer.fields.map((field) => [
        `${answer.id}:${field.id}:${field.fieldName}`,
        Array.isArray(field.value)
          ? field.value.join(" | ")
          : String(field.value),
      ]),
    );
    return [
      answer.formName,
      String(index + 1),
      ...Array.from(columns.keys(), (key) => values.get(key) ?? ""),
    ];
  });
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")
  );
}

export function summarizeAnswers(answers: FormData[]) {
  const numeric = new Map<
    string,
    { name: string; total: number; count: number }
  >();
  for (const answer of answers)
    for (const field of answer.fields) {
      if (!["number", "range"].includes(field.fieldType) || field.value === "")
        continue;
      const value = Number(field.value);
      if (!Number.isFinite(value)) continue;
      const key = `${answer.id}:${field.id}:${field.fieldName}`;
      const previous = numeric.get(key) ?? {
        name: `${answer.formName} · ${field.fieldName}`,
        total: 0,
        count: 0,
      };
      numeric.set(key, {
        ...previous,
        total: previous.total + value,
        count: previous.count + 1,
      });
    }
  return Array.from(numeric, ([key, entry]) => ({
    key,
    name: entry.name,
    average: entry.total / entry.count,
    count: entry.count,
  }));
}
