"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormGenerator } from "@/lib/use-form-generator";
import { templates } from "@/lib/productivity";
import { download } from "@/lib/storage";
import EditorSidebar from "@/components/forms/EditorSidebar";
import FormEditor from "@/components/forms/FormEditor";
import FormCollection from "@/components/forms/FormCollection";
import AnswerCollection from "@/components/forms/AnswerCollection";

export default function Home() {
  const controller = useFormGenerator();
  const {
    forms,
    answers,
    draft,
    responding,
    previewing,
    view,
    setView,
    ready,
    notice,
    reset,
    exportBackup,
    loadTemplate,
    saving,
    unsaved,
  } = controller;
  const [showTemplates, setShowTemplates] = useState(false);
  const context =
    view === "editor"
      ? previewing
        ? "Aperçu"
        : responding
          ? "Nouvelle réponse"
          : "Création"
      : view === "forms"
        ? "Bibliothèque"
        : "Résultats";
  return (
    <div className="workbench">
      <a href="#content" className="skip-link">
        Aller au contenu
      </a>
      <header className="studio-header">
        <div className="studio-masthead">
          <div className="studio-brand">
            <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="8"
                width="22"
                height="25"
                rx="4"
                fill="currentColor"
                opacity=".16"
              />
              <path
                d="M12 3h13l8 8v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M25 3v8h8M14 17h12M14 23h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <h1>Atelier de formulaires</h1>
              <p>Un espace pour vos questions.</p>
            </div>
          </div>
          <div className="studio-commands">
            <Button
              variant="outline"
              onClick={() => {
                if (reset()) setShowTemplates(false);
              }}
              disabled={!ready || saving}
            >
              + Nouveau formulaire
            </Button>
            <Button
              variant="outline"
              aria-expanded={showTemplates}
              aria-controls="template-library"
              onClick={() => setShowTemplates(!showTemplates)}
              disabled={!ready || saving}
            >
              Modèles
            </Button>
          </div>
        </div>
        <div className="studio-navigation">
          <nav aria-label="Navigation principale" className="workspace-tabs">
            {(
              [
                ["editor", "Éditeur"],
                ["forms", `Formulaires (${forms.length})`],
                ["answers", `Réponses (${answers.length})`],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                variant="outline"
                className="workspace-tab"
                aria-current={view === key ? "page" : undefined}
                onClick={() => {
                  setView(key);
                  setShowTemplates(false);
                }}
              >
                {label}
              </Button>
            ))}
          </nav>
          <p className="local-label">
            <span aria-hidden="true" />
            Sans compte · Espace local
          </p>
        </div>
      </header>
      <main id="content" className="workspace-content" tabIndex={-1}>
        <div className="document-context">
          <div>
            <span>{context}</span>
            <p>
              {view === "editor"
                ? draft.formName
                : view === "forms"
                  ? "Bibliothèque de formulaires"
                  : "Vos réponses enregistrées"}
            </p>
          </div>
          <p
            className={
              unsaved && !previewing ? "draft-indicator" : "saved-indicator"
            }
          >
            {saving
              ? "Enregistrement…"
              : previewing
                ? "Mode test · Sans enregistrement"
                : unsaved
                  ? "Saisie non enregistrée"
                  : "Prêt à travailler"}
          </p>
        </div>
        {view === "editor" && !responding && (
          <div className="document-toolbar" aria-label="Actions du formulaire">
            <Button
              aria-label="Enregistrer le formulaire"
              onClick={controller.save}
              disabled={
                !controller.writable ||
                !draft.fields.length ||
                controller.editingFieldId !== null
              }
            >
              Enregistrer
            </Button>
            <Button
              aria-label="Tester le formulaire"
              variant="outline"
              onClick={controller.startPreview}
              disabled={
                !draft.fields.length || controller.editingFieldId !== null
              }
            >
              Aperçu
            </Button>
            <Button
              variant="outline"
              aria-label="Ajouter un champ"
              aria-controls="field-settings"
              onClick={() => {
                document.getElementById("field-name")?.focus();
                document
                  .getElementById("field-settings")
                  ?.scrollIntoView({ block: "center" });
              }}
            >
              + Champ
            </Button>
            <Button
              aria-label="Exporter le brouillon"
              variant="link"
              disabled={!draft.fields.length}
              onClick={() =>
                download(
                  "brouillon-formulaire.json",
                  JSON.stringify([draft], null, 2),
                )
              }
            >
              Exporter le brouillon
            </Button>
          </div>
        )}
        {showTemplates && (
          <section
            id="template-library"
            className="template-library"
            aria-label="Modèles de formulaires"
          >
            <div className="template-intro">
              <div>
                <h2>Modèles de formulaires</h2>
                <p>Choisissez un modèle à personnaliser.</p>
              </div>
              <Button
                variant="outline"
                aria-label="Fermer les modèles"
                onClick={() => setShowTemplates(false)}
              >
                Fermer
              </Button>
            </div>
            <div className="template-grid">
              {templates.map((template) => (
                <article key={template.id}>
                  <span className="template-glyph" aria-hidden="true">
                    ✳
                  </span>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (loadTemplate(template.id)) setShowTemplates(false);
                    }}
                  >
                    Utiliser {template.name}
                  </Button>
                </article>
              ))}
            </div>
          </section>
        )}
        {notice && (
          <p role="status" className="notice workspace-notice">
            {notice}
          </p>
        )}
        {!ready ? (
          <div className="workspace-loading">
            <p role="status">Chargement de vos données…</p>
          </div>
        ) : (
          <>
            {view === "editor" && (
              <div
                className={`editor-workspace${responding ? " response-workspace" : ""}${draft.fields.length ? " has-fields" : ""}`}
              >
                <EditorSidebar controller={controller} />
                <FormEditor controller={controller} />
              </div>
            )}
            {view === "forms" && <FormCollection controller={controller} />}
            {view === "answers" && <AnswerCollection controller={controller} />}
          </>
        )}
      </main>
      <footer className="workbench-status">
        <p>
          <span className="status-indicator" aria-hidden="true" />
          Vos données restent dans ce navigateur.
        </p>
        <Button variant="link" onClick={exportBackup}>
          Sauvegarder toutes les données locales
        </Button>
      </footer>
    </div>
  );
}
