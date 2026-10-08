import { parseForms, type FormData } from "./forms";
export type CollectionKey = "allForms" | "allAnswers";
export class StorageConflictError extends Error {
  constructor() {
    super("La collection locale a changé.");
    this.name = "StorageConflictError";
  }
}
export function readLocalData(key: CollectionKey): FormData[] {
  const forms = parseForms(localStorage.getItem(key));
  if (
    key === "allForms" &&
    new Set(forms.map((form) => form.id)).size !== forms.length
  )
    throw new Error("Identifiants de formulaire dupliqués.");
  return forms;
}
export async function writeLocalData(
  key: CollectionKey,
  data: FormData[],
  expected: FormData[],
): Promise<void> {
  if (!navigator.locks)
    throw new Error(
      "Le navigateur ne permet pas de sécuriser les écritures entre onglets.",
    );
  await navigator.locks.request("atelier-formulaires-storage", () => {
    if (JSON.stringify(readLocalData(key)) !== JSON.stringify(expected))
      throw new StorageConflictError();
    localStorage.setItem(key, JSON.stringify(data));
  });
}
export function download(name: string, content: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
