import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormController } from "@/lib/use-form-generator";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import FieldControl from "./FieldControl";
import { blankResponse, fieldList } from "@/lib/forms";
export default function FormEditor({
  controller,
}: {
  controller: FormController;
}) {
  const {
    responding,
    draft,
    setDraft,
    setResponding,
    submit,
    updateValue,
    writable,
    onDragEnd,
    move,
    save,
  } = controller;
  return (
    <section className="panel min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {responding ? "Répondre au formulaire" : "Votre formulaire"}
        </h2>
        <span className="rounded-full bg-[#eef2eb] px-3 py-1 text-sm muted">
          {draft.fields.length} champ(s)
        </span>
      </div>
      {responding ? (
        <h3 className="mb-6 text-2xl font-semibold break-words">
          {draft.formName}
        </h3>
      ) : (
        <div className="mb-6">
          <label htmlFor="form-name" className="mb-2">
            Nom du formulaire
          </label>
          <Input
            id="form-name"
            value={draft.formName}
            onChange={(e) => setDraft({ ...draft, formName: e.target.value })}
            maxLength={200}
          />
        </div>
      )}
      {responding ? (
        <form onSubmit={submit} noValidate className="space-y-4">
          {draft.fields.map((field) => (
            <FieldControl
              key={field.id}
              field={field}
              onChange={(value) => updateValue(field.id, value)}
            />
          ))}
          <Button type="submit" disabled={!writable}>
            Enregistrer la réponse
          </Button>
        </form>
      ) : (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {draft.fields.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#cbd2cc] px-5 py-16 text-center">
                      <p className="text-lg font-semibold">
                        Tout commence par un champ.
                      </p>
                      <p className="mt-2 muted">
                        Ajoutez le premier avec le panneau de création.
                      </p>
                    </div>
                  )}
                  {draft.fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={String(field.id)}
                      index={index}
                    >
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="field"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span
                              {...drag.dragHandleProps}
                              aria-label={`Déplacer ${field.fieldName}`}
                              className="rounded px-2 py-1 text-sm muted cursor-grab"
                            >
                              ⠿{" "}
                              {
                                fieldList.find(
                                  (f) => f.value === field.fieldType,
                                )?.text
                              }
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => move(index, index - 1)}
                                disabled={index === 0}
                                aria-label={`Monter ${field.fieldName}`}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => move(index, index + 1)}
                                disabled={index === draft.fields.length - 1}
                                aria-label={`Descendre ${field.fieldName}`}
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                  setDraft({
                                    ...draft,
                                    fields: draft.fields.filter(
                                      (f) => f.id !== field.id,
                                    ),
                                  })
                                }
                                aria-label={`Supprimer ${field.fieldName}`}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </div>
                          <FieldControl
                            field={field}
                            disabled
                            onChange={() => {}}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={save} disabled={!writable || !draft.fields.length}>
              Enregistrer le formulaire
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDraft(blankResponse(draft));
                setResponding(true);
              }}
              disabled={!draft.fields.length}
            >
              Tester le formulaire
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
