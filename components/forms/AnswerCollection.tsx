import { Button } from "@/components/ui/button";
import type { FormController } from "@/lib/use-form-generator";
import { download } from "@/lib/storage";
export default function AnswerCollection({
  controller,
}: {
  controller: FormController;
}) {
  const { answers, writable, removeAnswer } = controller;
  return (
    <section className="panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Réponses enregistrées</h2>
        <Button
          variant="outline"
          onClick={() =>
            download("reponses.json", JSON.stringify(answers, null, 2))
          }
          disabled={!answers.length}
        >
          Exporter les réponses
        </Button>
      </div>
      <div className="answer-register">
        {answers.map((answer, index) => (
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
      {!answers.length && (
        <p className="py-12 text-center muted">
          Vous n’avez pas encore enregistré de réponse.
        </p>
      )}
    </section>
  );
}
