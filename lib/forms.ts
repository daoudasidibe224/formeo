let lastId = 0;
export const generateUniqueId = () => {
  lastId = Math.max(
    lastId + 1,
    Date.now() * 1000 + Math.floor(Math.random() * 1000),
  );
  return lastId;
};
export type FieldType =
  | "text"
  | "textarea"
  | "checkbox"
  | "radio"
  | "select"
  | "number"
  | "date"
  | "email"
  | "file"
  | "range";
export type FieldValue = string | number | boolean | string[];
export interface FieldOption {
  id: number;
  value: string | number | boolean;
}
export interface Field {
  id: number;
  fieldType: FieldType;
  fieldName: string;
  value: FieldValue;
  required: boolean;
  options?: FieldOption[];
  min?: number;
  max?: number;
  errorMessage?: string | null;
}
export interface FormData {
  id: number;
  formName: string;
  fields: Field[];
}
export type ViewType = "preview" | "formList" | "answerList";
export const fieldList: { value: FieldType; text: string }[] = [
  { value: "text", text: "Texte" },
  { value: "textarea", text: "Texte long" },
  { value: "email", text: "Email" },
  { value: "number", text: "Nombre" },
  { value: "date", text: "Date" },
  { value: "select", text: "Liste déroulante" },
  { value: "radio", text: "Choix unique" },
  { value: "checkbox", text: "Cases à cocher" },
  { value: "range", text: "Curseur" },
  { value: "file", text: "Fichier" },
];
export const initializeField = (
  type: FieldType,
  fieldName: string,
  required: boolean,
  min: number,
  max: number,
  options: FieldOption[],
): Field => ({
  id: generateUniqueId(),
  fieldType: type,
  fieldName: fieldName.trim(),
  required,
  value: type === "checkbox" ? [] : type === "range" ? min : "",
  ...(["number", "range"].includes(type) ? { min, max } : {}),
  ...(["select", "radio", "checkbox"].includes(type)
    ? { options: structuredClone(options) }
    : {}),
});
export const validateField = (field: Field): string | null => {
  const empty =
    field.value === "" ||
    field.value === false ||
    (Array.isArray(field.value) && field.value.length === 0) ||
    (typeof field.value === "string" && field.value.trim() === "");
  if (empty) return field.required ? "Ce champ est obligatoire." : null;
  if (field.fieldType === "number" || field.fieldType === "range") {
    const n = Number(field.value);
    if (!Number.isFinite(n)) return "Saisissez un nombre valide.";
    if (field.min !== undefined && n < field.min)
      return `La valeur minimale est ${field.min}.`;
    if (field.max !== undefined && n > field.max)
      return `La valeur maximale est ${field.max}.`;
  }
  if (
    field.fieldType === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(field.value))
  )
    return "Saisissez une adresse email valide.";
  if (
    field.options &&
    ["select", "radio", "checkbox"].includes(field.fieldType)
  ) {
    const allowed = field.options.map((option) => String(option.value));
    const values = Array.isArray(field.value)
      ? field.value
      : [String(field.value)];
    if (values.some((value) => !allowed.includes(value)))
      return "Sélectionnez une option proposée.";
  }
  return null;
};
export function blankResponse(form: FormData): FormData {
  return {
    ...structuredClone(form),
    fields: form.fields.map((field) => ({
      ...structuredClone(field),
      value:
        field.fieldType === "checkbox"
          ? []
          : field.fieldType === "range"
            ? (field.min ?? 0)
            : "",
      errorMessage: null,
    })),
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isOption(value: unknown): value is FieldOption {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.id) &&
    (typeof value.value === "string" ||
      typeof value.value === "boolean" ||
      (typeof value.value === "number" && Number.isFinite(value.value)))
  );
}
function isField(value: unknown): value is Field {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    typeof value.fieldType !== "string" ||
    !fieldList.some((type) => type.value === value.fieldType) ||
    typeof value.fieldName !== "string" ||
    !value.fieldName.trim() ||
    typeof value.required !== "boolean"
  )
    return false;
  if (!(
    typeof value.value === "string" ||
    typeof value.value === "boolean" ||
    (typeof value.value === "number" && Number.isFinite(value.value)) ||
    (Array.isArray(value.value) &&
      value.value.every((item) => typeof item === "string"))
  ))
    return false;
  if (
    value.errorMessage !== undefined &&
    value.errorMessage !== null &&
    typeof value.errorMessage !== "string"
  )
    return false;
  if (
    value.min !== undefined &&
    (typeof value.min !== "number" || !Number.isFinite(value.min))
  )
    return false;
  if (
    value.max !== undefined &&
    (typeof value.max !== "number" || !Number.isFinite(value.max))
  )
    return false;
  if (
    ["number", "range"].includes(value.fieldType) &&
    (typeof value.min !== "number" ||
      typeof value.max !== "number" ||
      value.min >= value.max)
  )
    return false;
  if (
    value.options !== undefined &&
    (!Array.isArray(value.options) || !value.options.every(isOption))
  )
    return false;
  if (["select", "radio", "checkbox"].includes(value.fieldType)) {
    if (
      !Array.isArray(value.options) ||
      !value.options.every(isOption) ||
      value.options.length < (value.fieldType === "checkbox" ? 1 : 2)
    )
      return false;
    if (
      new Set(value.options.map((option) => option.id)).size !==
        value.options.length ||
      new Set(value.options.map((option) => String(option.value))).size !==
        value.options.length ||
      value.options.some((option) => !String(option.value).trim())
    )
      return false;
  }
  return true;
}
export function isFormData(value: unknown): value is FormData {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.id) &&
    typeof value.formName === "string" &&
    !!value.formName.trim() &&
    Array.isArray(value.fields) &&
    value.fields.length > 0 &&
    value.fields.every(isField) &&
    new Set(value.fields.map((field) => field.id)).size === value.fields.length
  );
}
export function parseForms(raw: string | null): FormData[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isFormData))
    throw new Error("Le format des données est invalide.");
  return data;
}
