import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormController } from "@/lib/use-form-generator";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { fieldList, type FieldType } from "@/lib/forms";
export default function EditorSidebar({
  controller,
}: {
  controller: FormController;
}) {
  const {
    responding,
    addField,
    type,
    setType,
    setOptions,
    name,
    setName,
    options,
    min,
    max,
    setMin,
    setMax,
    required,
    setRequired,
  } = controller;
  return (
    <aside className="space-y-5">
      {!responding && (
        <form className="panel space-y-4" onSubmit={addField}>
          <h2 className="text-lg font-semibold">Ajouter un champ</h2>
          <label htmlFor="field-type">Type de champ</label>
          <select
            id="field-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as FieldType);
              setOptions("");
            }}
          >
            {fieldList.map((f) => (
              <option key={f.value} value={f.value}>
                {f.text}
              </option>
            ))}
          </select>
          <label htmlFor="field-name">Libellé</label>
          <Input
            id="field-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Votre prénom"
            required
            maxLength={160}
          />
          {["select", "radio", "checkbox"].includes(type) && (
            <>
              <label htmlFor="options">Options, une par ligne</label>
              <textarea
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                rows={4}
                placeholder={"Première option\nDeuxième option"}
              />
            </>
          )}
          {["number", "range"].includes(type) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="min">Minimum</label>
                <Input
                  id="min"
                  type="number"
                  step="any"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="max">Maximum</label>
                <Input
                  id="max"
                  type="number"
                  step="any"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                />
              </div>
            </div>
          )}
          <label className="flex items-center gap-2">
            <Input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Réponse obligatoire
          </label>
          <Button type="submit" className="w-full">
            Ajouter au formulaire
          </Button>
        </form>
      )}
      <SpotlightCard
        theme="light"
        spotlightColor="#74a579"
        intensity={0.3}
        proximity={0}
        flare={false}
        className="intro"
      >
        <h2 className="font-semibold">Votre espace local</h2>
        <p className="mt-2 text-sm leading-relaxed muted">
          Vos formulaires et vos réponses restent dans ce navigateur.
          Exportez-les pour les conserver ailleurs.
        </p>
        <p className="mt-3 text-sm muted">
          {responding
            ? "Les champs marqués * sont obligatoires."
            : "Déplacez les champs avec la poignée ou les flèches."}
        </p>
      </SpotlightCard>
    </aside>
  );
}
