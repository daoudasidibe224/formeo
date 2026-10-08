"use client";
import { Button } from "@/components/ui/button";
import { useFormGenerator } from "@/lib/use-form-generator";
import EditorSidebar from "@/components/forms/EditorSidebar";
import FormEditor from "@/components/forms/FormEditor";
import FormCollection from "@/components/forms/FormCollection";
import AnswerCollection from "@/components/forms/AnswerCollection";
export default function Home() {
  const controller = useFormGenerator();
  const { forms, answers, view, setView, ready, notice, reset, exportBackup } =
    controller;
  return (
    <main className="workbench">
      <a href="#content" className="skip-link">
        Aller au contenu
      </a>
      <header className="workbench-header">
        <div className="workbench-brand">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M7 3h12l6 6v20H7V3Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19 3v7h6M11 15h10M11 20h10M11 25h6"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <div>
            <h1>Atelier de formulaires</h1>
            <p>Conception et réponses · Espace local</p>
          </div>
        </div>
        <Button variant="outline" onClick={reset} disabled={!ready}>
          + Nouveau formulaire
        </Button>
      </header>
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
            onClick={() => setView(key)}
          >
            {label}
          </Button>
        ))}
      </nav>
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
