import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readLocalData,
  writeLocalData,
  StorageConflictError,
} from "../lib/storage";
import type { FormData } from "../lib/forms";
const form: FormData = {
  id: 1,
  formName: "Contact",
  fields: [
    { id: 2, fieldType: "text", fieldName: "Nom", value: "", required: true },
  ],
};
afterEach(() => vi.unstubAllGlobals());
describe("frontières du stockage local", () => {
  it("refuse une écriture périmée sans écraser les données", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify([form]),
      setItem,
    });
    expect(() => writeLocalData("allForms", [], [])).toThrow(
      StorageConflictError,
    );
    expect(setItem).not.toHaveBeenCalled();
  });
  it("permet plusieurs réponses au même formulaire mais refuse les formulaires dupliqués", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify([form, form]),
    });
    expect(() => readLocalData("allForms")).toThrow("dupliqués");
    expect(readLocalData("allAnswers")).toHaveLength(2);
  });
  it("propage les échecs de lecture et les quotas sans faux résultat", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("Accès refusé");
      },
    });
    expect(() => readLocalData("allForms")).toThrow("Accès refusé");
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("Quota");
      },
    });
    expect(() => writeLocalData("allForms", [form], [])).toThrow("Quota");
  });
});
