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
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
      <a href="#content" className="sr-only focus:not-sr-only">
        Aller au contenu
      </a>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm font-semibold tracking-wide muted">
            ATELIER DE FORMULAIRES
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Un formulaire, à votre façon.
          </h1>
          <p className="mt-3 muted">
            Composez vos champs. Recueillez vos réponses.
          </p>
        </div>
        <Button onClick={reset} disabled={!ready}>
          + Nouveau formulaire
        </Button>
      </header>
      <nav
        aria-label="Navigation principale"
        className="mb-6 flex flex-wrap gap-2"
      >
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
            aria-current={view === key ? "page" : undefined}
            onClick={() => setView(key)}
          >
            {label}
          </Button>
        ))}
      </nav>
      {notice && (
        <p role="status" className="notice mb-5">
          {notice}
        </p>
      )}
      {!ready ? (
        <p role="status">Chargement de vos données…</p>
      ) : (
        <div id="content">
          {view === "editor" && (
            <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
              <EditorSidebar controller={controller} />
              <FormEditor controller={controller} />
            </div>
          )}
          {view === "forms" && <FormCollection controller={controller} />}
          {view === "answers" && <AnswerCollection controller={controller} />}
        </div>
      )}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs muted">
        <p>Stockage local · Aucun compte nécessaire</p>
        <Button variant="link" onClick={exportBackup}>
          Sauvegarder toutes les données locales
        </Button>
      </footer>
    </main>
  );
}
