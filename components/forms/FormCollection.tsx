import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormController } from "@/lib/use-form-generator";
import { download } from "@/lib/storage";
export default function FormCollection({
  controller,
}: {
  controller: FormController;
}) {
  const {
    forms,
    answers,
    importRef,
    importData,
    writable,
    search,
    setSearch,
    openForm,
    removeForm,
    duplicateForm,
  } = controller;
  const displayed = forms.filter((form) =>
    form.formName
      .toLocaleLowerCase("fr")
      .includes(search.toLocaleLowerCase("fr")),
  );
  return (
    <section className="panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Vos formulaires</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              download("formulaires.json", JSON.stringify(forms, null, 2))
            }
            disabled={!forms.length}
          >
            Exporter
          </Button>
          <Button
            variant="outline"
            onClick={() => importRef.current?.click()}
            disabled={!writable}
          >
            Importer
          </Button>
          <Input
            ref={importRef}
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={importData}
            aria-label="Importer des formulaires JSON"
          />
        </div>
      </div>
      <label htmlFor="search" className="mb-2">
        Rechercher un formulaire
      </label>
      <Input
        id="search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nom du formulaire"
      />
      <div className="collection-index">
        {displayed.map((form) => (
          <article className="collection-entry min-w-0" key={form.id}>
            <h3 className="text-lg font-semibold break-words">
              {form.formName}
            </h3>
            <p className="mt-2 mb-5 text-sm muted">
              {form.fields.length} champ(s) ·{" "}
              {answers.filter((answer) => answer.id === form.id).length}{" "}
              réponse(s)
            </p>
            <div className="collection-actions">
              <Button onClick={() => openForm(form, true)}>
                Nouvelle réponse
              </Button>
              <Button variant="outline" onClick={() => openForm(form)}>
                Modifier
              </Button>
              <Button
                variant="outline"
                aria-label={`Dupliquer le formulaire ${form.formName}`}
                onClick={() => duplicateForm(form)}
              >
                Dupliquer
              </Button>
              <Button
                variant="destructive"
                aria-label={`Supprimer le formulaire ${form.formName}`}
                onClick={() => removeForm(form.id)}
                disabled={!writable}
              >
                Supprimer
              </Button>
            </div>
          </article>
        ))}
      </div>
      {displayed.length === 0 && (
        <p className="py-12 text-center muted">
          {forms.length
            ? "Aucun formulaire ne correspond à cette recherche."
            : "Vos formulaires enregistrés apparaîtront ici."}
        </p>
      )}
    </section>
  );
}
