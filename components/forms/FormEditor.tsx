import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormController } from "@/lib/use-form-generator";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import FieldControl from "./FieldControl";
import { fieldList } from "@/lib/forms";
export default function FormEditor({
  controller,
}: {
  controller: FormController;
}) {
  const {
    responding,
    previewing,
    draft,
    setDraft,
    submit,
    updateValue,
    writable,
    onDragEnd,
    move,
    editField,
    duplicateField,
    removeField,
    finishPreview,
  } = controller;
  return (
    <section className="panel document-sheet min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {responding
            ? previewing
              ? "Tester le formulaire"
              : "Répondre au formulaire"
            : "Votre formulaire"}
        </h2>
        <span className="field-count">{draft.fields.length} champ(s)</span>
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
          <Button type="submit" disabled={!previewing && !writable}>
            {previewing ? "Vérifier la saisie" : "Enregistrer la réponse"}
          </Button>
          {previewing && (
            <Button type="button" variant="outline" onClick={finishPreview}>
              Revenir à l’édition
            </Button>
          )}
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
                    <div className="document-empty">
                      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                        <path
                          d="M10 5h19l9 9v29H10V5Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M29 5v10h9M17 23h14M17 30h14M17 37h8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
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
                              className="field-handle"
                            >
                              ⠿{" "}
                              {
                                fieldList.find(
                                  (f) => f.value === field.fieldType,
                                )?.text
                              }
                            </span>
                            <div className="field-toolbar">
                              <Button
                                type="button"
                                variant="outline"
                                aria-label={`Configurer ${field.fieldName}`}
                                onClick={() => editField(field.id)}
                              >
                                Réglages
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                aria-label={`Dupliquer ${field.fieldName}`}
                                onClick={() => duplicateField(field.id)}
                              >
                                Dupliquer
                              </Button>
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
                                onClick={() => removeField(field.id)}
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
        </>
      )}
    </section>
  );
}
