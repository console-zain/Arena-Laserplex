"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaCategory } from "@/lib/media-keys";

interface MediaImageFieldProps {
  name: string;
  label: string;
  category: MediaCategory;
  initialKey?: string;
  initialPreviewUrl?: string | null;
  value?: string;
  previewUrl?: string | null;
  onValueChange?: (key: string, previewUrl: string | null) => void;
  onUploadingChange?: (name: string, isUploading: boolean) => void;
}

interface UploadResult {
  key: string;
  url: string;
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const inputClassName =
  "mt-1.5 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-slate-800";

function requestUpload(
  file: File,
  category: MediaCategory,
  onProgress: (progress: number) => void,
) {
  return new Promise<UploadResult>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();
    formData.set("file", file);
    formData.set("category", category);

    request.open("POST", "/api/admin/media");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      let payload: { key?: string; url?: string; error?: string };
      try {
        payload = JSON.parse(request.responseText) as typeof payload;
      } catch {
        reject(new Error("The upload server returned an invalid response."));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(payload.error ?? "Image upload failed."));
        return;
      }
      if (!payload.key || !payload.url) {
        reject(new Error("The upload server returned an incomplete response."));
        return;
      }

      resolve({ key: payload.key, url: payload.url });
    });
    request.addEventListener("error", () =>
      reject(new Error("Image upload failed. Check your connection and try again.")),
    );
    request.send(formData);
  });
}

async function requestDelete(key: string, category: MediaCategory) {
  const response = await fetch("/api/admin/media", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, category }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Image deletion failed.");
  }
}

export function MediaImageField({
  name,
  label,
  category,
  initialKey = "",
  initialPreviewUrl = null,
  value,
  previewUrl,
  onValueChange,
  onUploadingChange,
}: MediaImageFieldProps) {
  const isControlled = value !== undefined;
  const [uncontrolledKey, setUncontrolledKey] = useState(initialKey);
  const [uncontrolledPreview, setUncontrolledPreview] =
    useState(initialPreviewUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const selectedFile = useRef<HTMLInputElement>(null);
  const uploadedKey = useRef<string | null>(null);
  const uploadPreviewUrl = useRef<string | null>(null);
  const mediaKey = isControlled ? value : uncontrolledKey;
  const imagePreview = uploadPreview ?? (isControlled ? previewUrl : uncontrolledPreview);

  useEffect(
    () => () => {
      if (uploadPreviewUrl.current) {
        URL.revokeObjectURL(uploadPreviewUrl.current);
      }
    },
    [],
  );

  function setMediaValue(key: string, url: string | null) {
    if (isControlled) {
      onValueChange?.(key, url);
    } else {
      setUncontrolledKey(key);
      setUncontrolledPreview(url);
    }
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension) || (file.type && !allowedTypes.has(file.type))) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size < 1 || file.size > 5 * 1024 * 1024) {
      setError("Choose an image no larger than 5 MB.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    onUploadingChange?.(name, true);
    if (uploadPreviewUrl.current) {
      URL.revokeObjectURL(uploadPreviewUrl.current);
    }
    uploadPreviewUrl.current = URL.createObjectURL(file);
    setUploadPreview(uploadPreviewUrl.current);

    try {
      const result = await requestUpload(file, category, setProgress);
      const previousUploadedKey = uploadedKey.current;
      setMediaValue(result.key, result.url);
      setUploadPreview(null);
      URL.revokeObjectURL(uploadPreviewUrl.current);
      uploadPreviewUrl.current = null;
      uploadedKey.current = result.key;
      if (previousUploadedKey && previousUploadedKey !== result.key) {
        await requestDelete(previousUploadedKey, category);
      }
      setProgress(100);
    } catch (uploadError) {
      setUploadPreview(null);
      if (uploadPreviewUrl.current) {
        URL.revokeObjectURL(uploadPreviewUrl.current);
        uploadPreviewUrl.current = null;
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed. Try again.",
      );
    } finally {
      setIsUploading(false);
      onUploadingChange?.(name, false);
      if (selectedFile.current) {
        selectedFile.current.value = "";
      }
    }
  }

  async function removeImage() {
    setError("");
    if (uploadedKey.current && uploadedKey.current === mediaKey) {
      try {
        await requestDelete(uploadedKey.current, category);
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Image deletion failed. Try again.",
        );
        return;
      }
    }

    uploadedKey.current = null;
    setMediaValue("", null);
    setProgress(0);
  }

  return (
    <div className="sm:col-span-2">
      <label
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
        htmlFor={`admin-${name}`}
      >
        {label}
      </label>
      <input name={name} type="hidden" value={mediaKey ?? ""} />
      <input
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className={inputClassName}
        disabled={isUploading}
        id={`admin-${name}`}
        onChange={(event) => void handleFileChange(event.currentTarget.files?.[0])}
        ref={selectedFile}
        type="file"
      />
      <p className="mb-0 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        JPG, PNG, or WebP · maximum 5 MB
      </p>
      {isUploading ? (
        <div className="mt-3">
          <progress
            aria-label={`Uploading ${label}`}
            className="h-2 w-full accent-indigo-600"
            max={100}
            value={progress}
          />
          <p aria-live="polite" className="mb-0 mt-1 text-xs text-slate-500">
            {progress > 0 ? `Uploading ${progress}%` : "Preparing upload..."}
          </p>
        </div>
      ) : null}
      {imagePreview ? (
        <div className="relative mt-3 h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          <Image
            alt={`${label} preview`}
            className="object-contain"
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            src={imagePreview}
            unoptimized
          />
        </div>
      ) : null}
      {mediaKey ? (
        <button
          className="mt-3 text-sm font-medium text-rose-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 disabled:opacity-60 dark:text-rose-400"
          disabled={isUploading}
          onClick={() => void removeImage()}
          type="button"
        >
          Remove image
        </button>
      ) : null}
      {error ? (
        <p aria-live="polite" className="mb-0 mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
