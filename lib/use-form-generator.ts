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
import {
  cloneField,
  cloneForm,
  createTemplate,
  type TemplateId,
} from "./productivity";
const newForm = (): FormData => ({
  id: generateUniqueId(),
  formName: "Mon formulaire",
  fields: [],
});
const copy = (form: FormData) => structuredClone(form);
const fingerprint = (form: FormData) =>
  JSON.stringify({
    ...form,
    fields: form.fields.map((field) => ({ ...field, errorMessage: null })),
  });
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
  const [previewing, setPreviewing] = useState(false);
  const previewSource = useRef<FormData | null>(null);
  const [ready, setReady] = useState(false);
  const [writable, setWritable] = useState(false);
  const [saving, setSaving] = useState(false);
  const mutationInFlight = useRef(false);
  const responseSaved = useRef(false);
  const editingBase = useRef<string | null>(null);
  const draftBase = useRef("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [name, setName] = useState("");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [min, setMin] = useState("0");
  const [max, setMax] = useState("100");
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const dirty = ready && fingerprint(draft) !== draftBase.current;
  const configuredField = draft.fields.find(
    (field) => field.id === editingFieldId,
  );
  const pendingField =
    !responding &&
    (editingFieldId === null
      ? name.trim() !== ""
      : Boolean(
          configuredField &&
          (configuredField.fieldName !== name ||
            configuredField.fieldType !== type ||
            configuredField.required !== required ||
            (configuredField.options
              ?.map((option) => String(option.value))
              .join("\n") ?? "") !== options ||
            (["number", "range"].includes(type) &&
              (String(configuredField.min ?? 0) !== min ||
                String(configuredField.max ?? 100) !== max))),
        ));
  const unsaved = dirty || pendingField;
  useEffect(() => {
    if (!unsaved) return;
    const protect = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [unsaved]);
  useEffect(() => {
    const initial = newForm();
    draftBase.current = fingerprint(initial);
    setDraft(initial);
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
  function canReplaceDraft() {
    return (
      !unsaved ||
      window.confirm(
        "Remplacer votre saisie non enregistrée ? Annulez pour la conserver ou exportez le brouillon avant de continuer.",
      )
    );
  }
  function reset() {
    if (!canReplaceDraft()) return false;
    editingBase.current = null;
    responseSaved.current = false;
    const initial = newForm();
    draftBase.current = fingerprint(initial);
    setDraft(initial);
    setResponding(false);
    setPreviewing(false);
    previewSource.current = null;
    setView("editor");
    cancelFieldEdit();
    return true;
  }
  function loadTemplate(id: TemplateId) {
    if (!canReplaceDraft()) return false;
    editingBase.current = null;
    responseSaved.current = false;
    setDraft(createTemplate(id));
    setResponding(false);
    setPreviewing(false);
    previewSource.current = null;
    setView("editor");
    cancelFieldEdit();
    setNotice("");
    return true;
  }
  function duplicateForm(form: FormData) {
    if (!canReplaceDraft()) return;
    editingBase.current = null;
    setDraft(cloneForm(form));
    setResponding(false);
    setPreviewing(false);
    previewSource.current = null;
    setView("editor");
    cancelFieldEdit();
    setNotice(
      "Copie indépendante prête à personnaliser. Ses réponses ne sont pas copiées.",
    );
  }
  function editField(id: number) {
    const field = draft.fields.find((candidate) => candidate.id === id);
    if (!field) return;
    setEditingFieldId(id);
    setType(field.fieldType);
    setName(field.fieldName);
    setRequired(field.required);
    setOptions(
      field.options?.map((option) => String(option.value)).join("\n") ?? "",
    );
    setMin(String(field.min ?? 0));
    setMax(String(field.max ?? 100));
    requestAnimationFrame(() => document.getElementById("field-name")?.focus());
  }
  function cancelFieldEdit() {
    setEditingFieldId(null);
    setName("");
    setOptions("");
  }
  function duplicateField(id: number) {
    const index = draft.fields.findIndex((field) => field.id === id);
    if (index < 0) return;
    const cloned = cloneField(draft.fields[index]);
    cloned.fieldName += " — copie";
    setDraft({
      ...draft,
      fields: [
        ...draft.fields.slice(0, index + 1),
        cloned,
        ...draft.fields.slice(index + 1),
      ],
    });
    setNotice("Champ dupliqué. Ses réglages sont indépendants.");
  }
  function removeField(id: number) {
    if (editingFieldId === id) cancelFieldEdit();
    setDraft({
      ...draft,
      fields: draft.fields.filter((field) => field.id !== id),
    });
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
    if (editingFieldId !== null) {
      if (!draft.fields.some((current) => current.id === editingFieldId)) {
        cancelFieldEdit();
        setNotice("Ce champ n’existe plus. Ajoutez un nouveau champ.");
        return;
      }
      setDraft({
        ...draft,
        fields: draft.fields.map((current) =>
          current.id === editingFieldId
            ? { ...field, id: editingFieldId }
            : current,
        ),
      });
      cancelFieldEdit();
      setNotice("Réglages du champ mis à jour.");
    } else {
      setDraft({ ...draft, fields: [...draft.fields, field] });
      setName("");
      setNotice("Champ ajouté.");
    }
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
    editingBase.current = JSON.stringify(form);
    draftBase.current = fingerprint(form);
    setDraft(form);
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
    if ((!previewing && responseSaved.current) || mutationInFlight.current)
      return;
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
    if (previewing) {
      setNotice("Test validé. Aucune réponse n’a été enregistrée.");
      return;
    }
    const updated = [...answers, { ...copy(draft), fields }];
    if (!(await persist("allAnswers", updated))) return;
    responseSaved.current = true;
    draftBase.current = fingerprint({ ...draft, fields });
    setAnswers(updated);
    setResponding(false);
    setNotice("Réponse enregistrée.");
    setView("answers");
  }
  function openForm(form: FormData, answer = false) {
    if (!canReplaceDraft()) return;
    cancelFieldEdit();
    editingBase.current = answer ? null : JSON.stringify(form);
    responseSaved.current = false;
    const opened = answer ? blankResponse(form) : copy(form);
    draftBase.current = fingerprint(opened);
    setDraft(opened);
    setResponding(answer);
    setPreviewing(false);
    previewSource.current = null;
    setView("editor");
    setNotice("");
  }
  function startPreview() {
    previewSource.current = copy(draft);
    setDraft(blankResponse(draft));
    setResponding(true);
    setPreviewing(true);
    setNotice(
      "Mode test : votre formulaire est conservé, aucune réponse ne sera enregistrée.",
    );
  }
  function finishPreview() {
    if (!previewSource.current) return;
    setDraft(previewSource.current);
    previewSource.current = null;
    setResponding(false);
    setPreviewing(false);
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
        "formeo-sauvegarde.json",
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
    previewing,
    ready,
    writable: writable && !saving,
    saving,
    unsaved,
    notice,
    search,
    type,
    name,
    required,
    options,
    min,
    max,
    editingFieldId,
    importRef,
    setView,
    setDraft,
    setSearch,
    setType,
    setName,
    setRequired,
    setOptions,
    setMin,
    setMax,
    reset,
    loadTemplate,
    duplicateForm,
    duplicateField,
    editField,
    cancelFieldEdit,
    removeField,
    move,
    onDragEnd,
    addField,
    save,
    updateValue,
    submit,
    startPreview,
    finishPreview,
    openForm,
    removeForm,
    importData,
    exportBackup,
    removeAnswer,
  };
}
export type FormController = ReturnType<typeof useFormGenerator>;
