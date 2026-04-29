"use client";

// New Artwork submission form
// Eselbrücke: "intake desk" — artist fills in the form, files go to R2, draft goes to DB
//
// Upload flow:
// 1. Artist fills form + selects image file
// 2. onSubmit: POST /api/assets/upload → get presigned URL
// 3. PUT file directly to R2 (no server roundtrip for file bytes)
// 4. Server Action createArtworkDraft → INSERT into artworks (draft, image_url = cdnUrl)
//
// Mini-3D preview: TODO Phase 7 — placeholder image preview for now

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createArtworkDraft } from "./actions";

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------
const ArtworkFormSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  medium: z.string().max(100).optional(),
  dimensions: z.string().max(50).optional().describe("e.g. 80 × 60 cm"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  priceEur: z.coerce.number().min(0).optional(),
  editionSize: z.coerce.number().int().min(1).max(10).optional(),
  genreTags: z.string().optional().describe("comma-separated tags"),
});

type ArtworkFormValues = z.infer<typeof ArtworkFormSchema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewArtworkPage() {
  // Unwrap params — locale is available synchronously via use() in React 19
  // but for simplicity we read it from the URL client-side
  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] ?? "de"
      : "de";

  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtworkFormValues>({
    resolver: zodResolver(ArtworkFormSchema),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  }

  async function uploadImageToR2(file: File): Promise<{ cdnUrl: string; key: string }> {
    setUploadProgress("Uploading image…");

    const presignRes = await fetch("/api/assets/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        assetType: "image",
      }),
    });

    if (!presignRes.ok) {
      const err = (await presignRes.json()) as { error?: string };
      throw new Error(err.error ?? "Failed to get upload URL");
    }

    const { uploadUrl, cdnUrl, key } = (await presignRes.json()) as {
      uploadUrl: string;
      cdnUrl: string;
      key: string;
    };

    // Direct PUT to R2 (no server bandwidth cost)
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("R2 upload failed");

    setUploadProgress(null);
    return { cdnUrl, key };
  }

  async function onSubmit(values: ArtworkFormValues) {
    setServerError(null);
    startTransition(async () => {
      try {
        let imageUrl: string | undefined;
        let imageR2Key: string | undefined;

        if (imageFile) {
          const { cdnUrl, key } = await uploadImageToR2(imageFile);
          imageUrl = cdnUrl;
          imageR2Key = key;
        }

        const tags = values.genreTags
          ? values.genreTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];

        const result = await createArtworkDraft({
          title: values.title,
          medium: values.medium,
          dimensions: values.dimensions,
          year: values.year,
          priceEur: values.priceEur,
          editionSize: values.editionSize,
          genreTags: tags,
          imageUrl,
          imageR2Key,
        });

        if ("error" in result) {
          setServerError(result.error);
        } else {
          setSuccess(true);
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  const t =
    locale === "de"
      ? {
          heading: "Neues Werk einreichen",
          back: "← Meine Werke",
          title: "Titel *",
          medium: "Medium (z.B. Öl auf Leinwand)",
          dimensions: "Maße (z.B. 80 × 60 cm)",
          year: "Jahr",
          price: "Preis in Euro",
          edition: "Auflagenhöhe (1–10)",
          tags: "Tags (kommagetrennt)",
          image: "Hauptbild",
          submit: "Als Entwurf speichern",
          successMsg: "Artwork eingereicht! Es wird nach Überprüfung veröffentlicht.",
        }
      : {
          heading: "Submit New Artwork",
          back: "← My Artworks",
          title: "Title *",
          medium: "Medium (e.g. Oil on canvas)",
          dimensions: "Dimensions (e.g. 80 × 60 cm)",
          year: "Year",
          price: "Price in EUR",
          edition: "Edition size (1–10)",
          tags: "Tags (comma-separated)",
          image: "Main image",
          submit: "Save as draft",
          successMsg: "Artwork submitted! It will be published after review.",
        };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-400 text-lg mb-4">✓ {t.successMsg}</p>
          <Link
            href={`/${locale}/dashboard/artist`}
            className="text-cyan-400 underline underline-offset-2 text-sm"
          >
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={`/${locale}/dashboard/artist`}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {t.back}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold mb-8">{t.heading}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <Field label={t.title} error={errors.title?.message}>
            <Input {...register("title")} placeholder="Ohne Titel (2026)" />
          </Field>

          {/* Image upload + preview */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t.image}</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
            />
            {/* Image preview — TODO Phase 7: replace with mini R3F canvas */}
            {imagePreview && (
              <div className="mt-3 relative aspect-video w-full max-w-xs overflow-hidden rounded-md border border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <p className="absolute bottom-1 right-1 text-[10px] text-zinc-500 bg-black/60 px-1 rounded">
                  Preview (3D in Phase 7)
                </p>
              </div>
            )}
            {uploadProgress && (
              <p className="mt-2 text-xs text-cyan-400">{uploadProgress}</p>
            )}
          </div>

          {/* Medium + Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.medium} error={errors.medium?.message}>
              <Input {...register("medium")} placeholder="Digital Print" />
            </Field>
            <Field label={t.dimensions} error={errors.dimensions?.message}>
              <Input {...register("dimensions")} placeholder="100 × 70 cm" />
            </Field>
          </div>

          {/* Year + Price + Edition */}
          <div className="grid grid-cols-3 gap-4">
            <Field label={t.year} error={errors.year?.message}>
              <Input
                {...register("year")}
                type="number"
                placeholder="2026"
              />
            </Field>
            <Field label={t.price} error={errors.priceEur?.message}>
              <Input
                {...register("priceEur")}
                type="number"
                step="0.01"
                placeholder="500.00"
              />
            </Field>
            <Field label={t.edition} error={errors.editionSize?.message}>
              <Input
                {...register("editionSize")}
                type="number"
                placeholder="1"
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label={t.tags} error={errors.genreTags?.message}>
            <Input
              {...register("genreTags")}
              placeholder="abstract, neon, digital"
            />
          </Field>

          {/* Error */}
          {serverError && (
            <p className="text-sm text-red-400 rounded bg-red-900/20 px-3 py-2">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold py-3 transition-colors"
          >
            {isPending ? "…" : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
    />
  );
});

// React import for forwardRef
import React from "react";
