"use client";
import { useEffect, useRef, useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import {
  blankResponse,
  generateUniqueId,
  initializeField,
  parseForms,
  validateField,
  type FieldType,
  type FieldValue,
  type FormData,
} from "./forms";
import {
  download,
  readLocalData,
  writeLocalData,
  StorageConflictError,
} from "./storage";
const newForm = (): FormData => ({
  id: generateUniqueId(),
  formName: "Mon formulaire",
  fields: [],
});
const copy = (form: FormData) => structuredClone(form);
export function useFormGenerator() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [answers, setAnswers] = useState<FormData[]>([]);
  const [draft, setDraft] = useState<FormData>({
    id: 0,
    formName: "Mon formulaire",
    fields: [],
  });
  const [view, setView] = useState<"editor" | "forms" | "answers">("editor");
  const [responding, setResponding] = useState(false);
  const [ready, setReady] = useState(false);
  const [writable, setWritable] = useState(false);
  const [saving, setSaving] = useState(false);
  const mutationInFlight = useRef(false);
  const responseSaved = useRef(false);
  const editingBase = useRef<string | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [name, setName] = useState("");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [min, setMin] = useState("0");
  const [max, setMax] = useState("100");
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setDraft(newForm());
    try {
      setForms(readLocalData("allForms"));
      setAnswers(readLocalData("allAnswers"));
      setWritable(Boolean(navigator.locks));
      if (!navigator.locks)
        setNotice(
          "Ce navigateur ne permet pas de protéger les sauvegardes entre onglets. La lecture et l’export restent disponibles. Ouvrez l’application dans un navigateur récent, sur HTTPS ou localhost, pour enregistrer.",
        );
    } catch {
      setNotice(
        "Les données locales sont illisibles ou le stockage est indisponible. Exportez une sauvegarde avant de réinitialiser le stockage du navigateur.",
      );
    }
    setReady(true);
    function syncStorage(event: StorageEvent) {
      if (event.key !== null && !["allForms", "allAnswers"].includes(event.key))
        return;
      try {
        setForms(readLocalData("allForms"));
        setAnswers(readLocalData("allAnswers"));
        setWritable(Boolean(navigator.locks));
        setNotice("Données mises à jour depuis un autre onglet.");
      } catch {
        setWritable(false);
        setNotice(
          "Les données locales ont changé et sont illisibles. Exportez une sauvegarde avant de les réinitialiser.",
        );
      }
    }
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);
  async function persist(key: "allForms" | "allAnswers", data: FormData[]) {
    if (!writable || mutationInFlight.current) return false;
    mutationInFlight.current = true;
    setSaving(true);
    try {
      await writeLocalData(key, data, key === "allForms" ? forms : answers);
      return true;
    } catch (error) {
      if (error instanceof StorageConflictError) {
        try {
          setForms(readLocalData("allForms"));
          setAnswers(readLocalData("allAnswers"));
        } catch {
          setWritable(false);
          setNotice(
            "Les données locales sont illisibles. Exportez une sauvegarde avant de les réinitialiser.",
          );
          return false;
        }
        setNotice(
          "Les données ont changé dans un autre onglet. Vérifiez la liste avant de réessayer.",
        );
        return false;
      }
      setNotice(
        "Le navigateur ne peut pas enregistrer ces données. Libérez de l’espace ou exportez une sauvegarde.",
      );
      return false;
    } finally {
      mutationInFlight.current = false;
      setSaving(false);
    }
  }
  function reset() {
    editingBase.current = null;
    responseSaved.current = false;
    setDraft(newForm());
    setResponding(false);
    setView("editor");
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= draft.fields.length) return;
    const fields = [...draft.fields];
    const [field] = fields.splice(from, 1);
    fields.splice(to, 0, field);
    setDraft({ ...draft, fields });
  }
  function onDragEnd(result: DropResult) {
    if (result.destination) move(result.source.index, result.destination.index);
  }
  function addField(event: React.FormEvent) {
    event.preventDefault();
    const needsOptions = ["select", "radio", "checkbox"].includes(type);
    const values = options
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const numeric = ["number", "range"].includes(type);
    if (!name.trim()) return;
    if (
      needsOptions &&
      (values.length < (type === "checkbox" ? 1 : 2) ||
        new Set(values).size !== values.length)
    ) {
      setNotice(
        "Ajoutez des options différentes, une par ligne (deux pour une liste ou un choix unique).",
      );
      return;
    }
    if (
      numeric &&
      (!min.trim() ||
        !max.trim() ||
        !Number.isFinite(Number(min)) ||
        !Number.isFinite(Number(max)) ||
        Number(min) >= Number(max))
    ) {
      setNotice(
        "Le minimum et le maximum doivent être des nombres, avec un minimum inférieur au maximum.",
      );
      return;
    }
    const field = initializeField(
      type,
      name,
      required,
      Number(min),
      Number(max),
      values.map((value) => ({ id: generateUniqueId(), value })),
    );
    setDraft({ ...draft, fields: [...draft.fields, field] });
    setName("");
    setNotice("Champ ajouté.");
  }
  async function save() {
    if (!draft.formName.trim() || draft.fields.length === 0) {
      setNotice("Donnez un nom au formulaire et ajoutez au moins un champ.");
      return;
    }
    const form = { ...copy(draft), formName: draft.formName.trim() };
    if (editingBase.current !== null) {
      try {
        const actual = readLocalData("allForms").find(
          (saved) => saved.id === draft.id,
        );
        if (JSON.stringify(actual) !== editingBase.current) {
          setNotice(
            "Ce formulaire a été modifié ou supprimé dans un autre onglet. Votre brouillon est conservé : exportez-le ou rouvrez la version enregistrée avant de continuer.",
          );
          return;
        }
      } catch {
        setNotice(
          "Le stockage est indisponible. Votre brouillon est conservé.",
        );
        return;
      }
    }
    const updated = forms.some((f) => f.id === form.id)
      ? forms.map((f) => (f.id === form.id ? form : f))
      : [...forms, form];
    if (!(await persist("allForms", updated))) return;
    setForms(updated);
    setNotice("Formulaire enregistré dans ce navigateur.");
    setView("forms");
  }
  function updateValue(id: number, value: FieldValue) {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, value, errorMessage: null } : field,
      ),
    }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (responseSaved.current || mutationInFlight.current) return;
    const fields = draft.fields.map((field) => ({
      ...field,
      errorMessage: validateField(field),
    }));
    setDraft({ ...draft, fields });
    const invalid = fields.find((field) => field.errorMessage);
    if (invalid) {
      setNotice("Vérifiez les champs indiqués.");
      document.getElementById(`field-${invalid.id}`)?.focus();
      return;
    }
    const updated = [...answers, { ...copy(draft), fields }];
    if (!(await persist("allAnswers", updated))) return;
    responseSaved.current = true;
    setAnswers(updated);
    setResponding(false);
    setNotice("Réponse enregistrée.");
    setView("answers");
  }
  function openForm(form: FormData, answer = false) {
    editingBase.current = answer ? null : JSON.stringify(form);
    responseSaved.current = false;
    setDraft(answer ? blankResponse(form) : copy(form));
    setResponding(answer);
    setView("editor");
    setNotice("");
  }
  async function removeForm(id: number) {
    if (
      !window.confirm(
        "Supprimer ce formulaire ? Les réponses enregistrées seront conservées.",
      )
    )
      return;
    const updated = forms.filter((form) => form.id !== id);
    if (await persist("allForms", updated)) {
      setForms(updated);
      setNotice("Formulaire supprimé.");
    }
  }
  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("Le fichier dépasse 1 Mo.");
      const imported = parseForms(await file.text());
      if (new Set(imported.map((f) => f.id)).size !== imported.length)
        throw new Error(
          "Le fichier contient des identifiants de formulaire en double.",
        );
      // Import as new forms so an existing form is never overwritten.
      const merged = [
        ...forms,
        ...imported.map((form) => ({ ...form, id: generateUniqueId() })),
      ];
      if (await persist("allForms", merged)) {
        setForms(merged);
        setView("forms");
        setNotice(`${imported.length} formulaire(s) importé(s).`);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Impossible de lire le fichier.",
      );
    }
    event.target.value = "";
  }
  function exportBackup() {
    try {
      download(
        "formgenerator-sauvegarde.json",
        JSON.stringify(
          {
            forms: localStorage.getItem("allForms"),
            answers: localStorage.getItem("allAnswers"),
          },
          null,
          2,
        ),
      );
    } catch {
      setNotice("Le stockage du navigateur est inaccessible.");
    }
  }
  async function removeAnswer(index: number) {
    if (!window.confirm("Supprimer cette réponse ?")) return;
    const updated = answers.filter((_, i) => i !== index);
    if (await persist("allAnswers", updated)) setAnswers(updated);
  }
  return {
    forms,
    answers,
    draft,
    view,
    responding,
    ready,
    writable: writable && !saving,
    saving,
    notice,
    search,
    type,
    name,
    required,
    options,
    min,
    max,
    importRef,
    setView,
    setDraft,
    setResponding: (value: boolean) => {
      if (value) responseSaved.current = false;
      setResponding(value);
    },
    setSearch,
    setType,
    setName,
    setRequired,
    setOptions,
    setMin,
    setMax,
    reset,
    move,
    onDragEnd,
    addField,
    save,
    updateValue,
    submit,
    openForm,
    removeForm,
    importData,
    exportBackup,
    removeAnswer,
  };
}
export type FormController = ReturnType<typeof useFormGenerator>;
