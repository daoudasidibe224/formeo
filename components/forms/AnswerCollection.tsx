import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormController } from "@/lib/use-form-generator";
import { download } from "@/lib/storage";
import {
  answersCsv,
  filterAnswers,
  summarizeAnswers,
} from "@/lib/productivity";
export default function AnswerCollection({
  controller,
}: {
  controller: FormController;
}) {
  const { answers, writable, removeAnswer } = controller;
  const [formId, setFormId] = useState("");
  const [query, setQuery] = useState("");
  const forms = Array.from(
    new Map(answers.map((answer) => [answer.id, answer.formName])),
  );
  const displayed = filterAnswers(answers, formId, query);
  const selected = displayed.map((entry) => entry.answer);
  const statistics = summarizeAnswers(selected);
  return (
    <section className="panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Réponses enregistrées</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              download("reponses.json", JSON.stringify(selected, null, 2))
            }
            disabled={!selected.length}
          >
            Exporter les réponses
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              download(
                "reponses.csv",
                answersCsv(selected),
                "text/csv;charset=utf-8",
              )
            }
            disabled={!selected.length}
          >
            Exporter en CSV
          </Button>
        </div>
      </div>
      <div className="answer-filters">
        <div>
          <label htmlFor="answer-form">Filtrer par formulaire</label>
          <select
            id="answer-form"
            value={formId}
            onChange={(event) => setFormId(event.target.value)}
          >
            <option value="">Tous les formulaires</option>
            {forms.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="answer-query">Rechercher dans les réponses</label>
          <Input
            id="answer-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, email, valeur saisie…"
          />
        </div>
      </div>
      <p className="answer-count" aria-live="polite">
        {selected.length} réponse(s) affichée(s) sur {answers.length}. Les
        exports suivent ces filtres.
      </p>
      {statistics.length > 0 && (
        <details className="answer-summary">
          <summary>Synthèse des nombres et notes</summary>
          <dl>
            {statistics.map((entry) => (
              <div key={entry.key}>
                <dt>{entry.name}</dt>
                <dd>
                  Moyenne :{" "}
                  {entry.average.toLocaleString("fr", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  · {entry.count} valeur(s)
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      <div className="answer-register">
        {displayed.map(({ answer, index }) => (
          <article key={index} className="answer-entry min-w-0">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold break-words">
                {answer.formName}
              </h3>
              <Button
                variant="destructive"
                aria-label={`Supprimer la réponse ${index + 1}`}
                disabled={!writable}
                onClick={() => removeAnswer(index)}
              >
                Supprimer
              </Button>
            </div>
            <dl className="space-y-3">
              {answer.fields.map((field) => (
                <div key={field.id}>
                  <dt className="text-sm muted break-words">
                    {field.fieldName}
                  </dt>
                  <dd className="mt-1 break-words">
                    {Array.isArray(field.value)
                      ? field.value.join(", ") || "Aucune sélection"
                      : String(field.value) || "Sans réponse"}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      {!selected.length && (
        <p className="py-12 text-center muted">
          {answers.length
            ? "Aucune réponse ne correspond à ces filtres."
            : "Vous n’avez pas encore enregistré de réponse."}
        </p>
      )}
    </section>
  );
}
