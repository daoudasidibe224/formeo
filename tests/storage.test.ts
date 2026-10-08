import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
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
beforeEach(() =>
  vi.stubGlobal("navigator", {
    locks: {
      request: async (_name: string, callback: () => unknown) => callback(),
    },
  }),
);
describe("frontières du stockage local", () => {
  it("refuse d’écrire sans verrou entre onglets", async () => {
    const setItem = vi.fn();
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    await expect(writeLocalData("allForms", [form], [])).rejects.toThrow(
      "sécuriser les écritures",
    );
    expect(setItem).not.toHaveBeenCalled();
  });
  it("refuse une écriture périmée sans écraser les données", async () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify([form]),
      setItem,
    });
    await expect(writeLocalData("allForms", [], [])).rejects.toThrow(
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
  it("propage les échecs de lecture et les quotas sans faux résultat", async () => {
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
    await expect(writeLocalData("allForms", [form], [])).rejects.toThrow(
      "Quota",
    );
  });
});
