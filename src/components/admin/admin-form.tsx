"use client";

import { MediaImageField } from "@/components/admin/media-image-field";
import { useActionState, useState } from "react";
import type { AdminActionState } from "@/lib/admin-action-state";
import type { MediaCategory } from "@/lib/media-keys";

export interface AdminFormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "date"
    | "datetime-local"
    | "number"
    | "url"
    | "textarea"
    | "select"
    | "checkbox"
    | "image";
  value?: string;
  placeholder?: string;
  required?: boolean;
  options?: readonly string[];
  step?: string;
  category?: MediaCategory;
  previewUrl?: string | null;
}

interface AdminFormProps {
  title?: string;
  description?: string;
  fields: readonly AdminFormField[];
  hiddenFields?: Readonly<Record<string, string>>;
  action?: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  submitLabel?: string;
}

const fieldClassName =
  "mt-1.5 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export function AdminForm({
  title,
  description,
  fields,
  hiddenFields,
  action,
  submitLabel = "Save changes",
}: AdminFormProps) {
  const [state, formAction, isPending] = useActionState(
    action ??
      (async () => ({
        error: "This form is not connected to database persistence.",
      })),
    {},
  );
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.value ?? ""])),
  );
  const [previews, setPreviews] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, field.previewUrl ?? null]),
    ),
  );
  const [editedFields, setEditedFields] = useState<string[]>([]);
  const [uploadingFields, setUploadingFields] = useState<string[]>([]);

  function updateValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setEditedFields((current) =>
      current.includes(name) ? current : [...current, name],
    );
  }

  function updateUploadingField(name: string, uploading: boolean) {
    setUploadingFields((current) =>
      uploading
        ? current.includes(name)
          ? current
          : [...current, name]
        : current.filter((fieldName) => fieldName !== name),
    );
  }

  return (
    <form
      action={formAction}
      className="admin-form-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6"
    >
      {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      {title ? (
        <h2 className="m-0 text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mb-0 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldError = editedFields.includes(field.name)
            ? undefined
            : state.fieldErrors?.[field.name];
          const errorId = `admin-${field.name}-error`;

          return (
            <div
              className={
                field.type === "textarea" || field.type === "image"
                  ? "sm:col-span-2"
                  : ""
              }
              key={field.name}
            >
              {field.type === "image" ? (
                <>
                  <MediaImageField
                    category={field.category ?? "event"}
                    label={field.label}
                    name={field.name}
                    onUploadingChange={updateUploadingField}
                    onValueChange={(key, previewUrl) => {
                      updateValue(field.name, key);
                      setPreviews((current) => ({
                        ...current,
                        [field.name]: previewUrl,
                      }));
                    }}
                    previewUrl={previews[field.name] ?? null}
                    value={values[field.name] ?? ""}
                  />
                  {fieldError ? (
                    <p
                      className="mb-0 mt-2 text-sm text-rose-600 dark:text-rose-400"
                      id={errorId}
                    >
                      {fieldError}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <label
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor={`admin-${field.name}`}
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      aria-describedby={fieldError ? errorId : undefined}
                      aria-invalid={Boolean(fieldError)}
                      className={`${fieldClassName} min-h-28 resize-y`}
                      id={`admin-${field.name}`}
                      name={field.name}
                      onChange={(event) =>
                        updateValue(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                      value={values[field.name] ?? ""}
                    />
                  ) : field.type === "select" ? (
                    <select
                      aria-describedby={fieldError ? errorId : undefined}
                      aria-invalid={Boolean(fieldError)}
                      className={fieldClassName}
                      id={`admin-${field.name}`}
                      name={field.name}
                      onChange={(event) =>
                        updateValue(field.name, event.target.value)
                      }
                      required={field.required}
                      value={
                        values[field.name] ?? field.options?.[0] ?? ""
                      }
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <input
                      aria-describedby={fieldError ? errorId : undefined}
                      aria-invalid={Boolean(fieldError)}
                      checked={values[field.name] === "true"}
                      className="ml-2 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                      id={`admin-${field.name}`}
                      name={field.name}
                      onChange={(event) =>
                        updateValue(
                          field.name,
                          event.target.checked ? "true" : "false",
                        )
                      }
                      type="checkbox"
                      value="true"
                    />
                  ) : (
                    <input
                      aria-describedby={fieldError ? errorId : undefined}
                      aria-invalid={Boolean(fieldError)}
                      className={fieldClassName}
                      id={`admin-${field.name}`}
                      name={field.name}
                      onChange={(event) =>
                        updateValue(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      step={field.step}
                      type={field.type}
                      value={values[field.name] ?? ""}
                    />
                  )}
                  {fieldError ? (
                    <p
                      className="mb-0 mt-1.5 text-sm text-rose-600 dark:text-rose-400"
                      id={errorId}
                    >
                      {fieldError}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || uploadingFields.length > 0}
          type="submit"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
      {state.error ? (
        <p
          aria-live="polite"
          className="mb-0 mt-4 text-sm text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          aria-live="polite"
          className="mb-0 mt-4 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
