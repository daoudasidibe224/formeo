import { Input } from "@/components/ui/input";
import type { Field, FieldValue } from "@/lib/forms";
export default function FieldControl({
  field,
  onChange,
  disabled = false,
}: {
  field: Field;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const id = `field-${field.id}`;
  const props = {
    id,
    disabled,
    "aria-invalid": !!field.errorMessage,
    "aria-describedby": field.errorMessage ? `${id}-error` : undefined,
  };
  const options = field.options ?? [];
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="break-words">
        {field.fieldName}
        {field.required && <span aria-label="obligatoire"> *</span>}
      </label>
      {["text", "email", "date", "number", "file"].includes(
        field.fieldType,
      ) && (
        <Input
          {...props}
          type={field.fieldType}
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.fieldType === "number" ? "any" : undefined}
          value={field.fieldType === "file" ? undefined : String(field.value)}
          onChange={(e) =>
            onChange(
              field.fieldType === "file"
                ? (e.target.files?.[0]?.name ?? "")
                : field.fieldType === "number" && e.target.value !== ""
                  ? Number(e.target.value)
                  : e.target.value,
            )
          }
        />
      )}
      {field.fieldType === "textarea" && (
        <textarea
          {...props}
          required={field.required}
          rows={4}
          value={String(field.value)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.fieldType === "file" && (
        <p className="text-xs muted">
          Seul le nom du fichier est enregistré, pas son contenu.
        </p>
      )}
      {field.fieldType === "select" && (
        <select
          {...props}
          value={String(field.value)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Sélectionner une option</option>
          {options.map((option) => (
            <option key={option.id} value={String(option.value)}>
              {String(option.value)}
            </option>
          ))}
        </select>
      )}
      {["checkbox", "radio"].includes(field.fieldType) && (
        <fieldset
          id={id}
          tabIndex={-1}
          aria-describedby={props["aria-describedby"]}
          className="space-y-3"
        >
          <legend className="sr-only">{field.fieldName}</legend>
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 font-normal"
            >
              <Input
                type={field.fieldType}
                disabled={disabled}
                name={id}
                checked={
                  field.fieldType === "radio"
                    ? field.value === String(option.value)
                    : Array.isArray(field.value) &&
                      field.value.includes(String(option.value))
                }
                onChange={(e) => {
                  if (field.fieldType === "radio")
                    onChange(String(option.value));
                  else {
                    const current = Array.isArray(field.value)
                      ? field.value
                      : [];
                    onChange(
                      e.target.checked
                        ? [...current, String(option.value)]
                        : current.filter(
                            (value) => value !== String(option.value),
                          ),
                    );
                  }
                }}
              />
              {String(option.value)}
            </label>
          ))}
        </fieldset>
      )}
      {field.fieldType === "range" && (
        <div className="flex items-center gap-4">
          <Input
            {...props}
            type="range"
            className="w-full"
            min={field.min}
            max={field.max}
            value={Number(field.value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <output htmlFor={id}>{String(field.value)}</output>
        </div>
      )}
      {field.errorMessage && (
        <p id={`${id}-error`} role="alert" className="danger text-sm">
          {field.errorMessage}
        </p>
      )}
    </div>
  );
}
