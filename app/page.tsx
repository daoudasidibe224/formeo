"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormGenerator } from "@/lib/use-form-generator";
import { templates } from "@/lib/productivity";
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
    view,
    setView,
    ready,
    notice,
    reset,
    exportBackup,
    loadTemplate,
    saving,
  } = controller;
  const [showTemplates, setShowTemplates] = useState(false);
  return (
    <main className="workbench">
      <a href="#content" className="skip-link">
        Aller au contenu
      </a>
      <header className="workbench-header">
        <div className="workbench-title">
          <h1>Atelier de formulaires</h1>
          <span>Sans compte · Dans ce navigateur</span>
        </div>
        <div className="workbench-commandbar">
          <div className="file-commands" aria-label="Actions du document">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setShowTemplates(false);
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
                variant={view === key ? "default" : "outline"}
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
        </div>
        <div className="document-context">
          <span>
            {view === "editor"
              ? responding
                ? "SAISIE"
                : "CONCEPTION"
              : view === "forms"
                ? "REGISTRE"
                : "RÉSULTATS"}
          </span>
          <p>
            {view === "editor"
              ? draft.formName
              : view === "forms"
                ? "Vos documents enregistrés"
                : "Analyser et exporter les réponses"}
          </p>
          <span>{saving ? "Enregistrement…" : "Espace local"}</span>
        </div>
      </header>
      {showTemplates && (
        <section
          id="template-library"
          className="template-library"
          aria-label="Modèles de formulaires"
        >
          <div className="template-intro">
            <h2>Partir d’un modèle</h2>
            <p>
              Personnalisez les champs avant d’enregistrer. Les modèles ne
              contiennent aucune réponse.
            </p>
          </div>
          <div className="template-grid">
            {templates.map((template) => (
              <article key={template.id}>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <Button
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
        <p role="status" className="workspace-loading">
          Chargement de vos données…
        </p>
      ) : (
        <div id="content" className="workspace-content" tabIndex={-1}>
          {view === "editor" && (
            <div className="editor-workspace">
              <EditorSidebar controller={controller} />
              <FormEditor controller={controller} />
            </div>
          )}
          {view === "forms" && <FormCollection controller={controller} />}
          {view === "answers" && <AnswerCollection controller={controller} />}
        </div>
      )}
      <footer className="workbench-status">
        <p>
          <span className="status-indicator" aria-hidden="true" />
          Stockage dans ce navigateur
        </p>
        <Button variant="link" onClick={exportBackup}>
          Sauvegarder toutes les données locales
        </Button>
      </footer>
    </main>
  );
}
