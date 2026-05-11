"use client";

import Image from "next/image";
import { useState } from "react";
import { MEDIA_UPLOAD_URL, type MediaUploadResponse } from "@/lib/media-upload";

export function ImageUploader({ defaultUrl = "" }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [status, setStatus] = useState("");

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("Image must be smaller than 5MB.");
      return;
    }

    setStatus("Uploading image...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(MEDIA_UPLOAD_URL, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const data = (await response.json()) as MediaUploadResponse;
      if (!data.secure_url) throw new Error("Upload response did not include secure_url");
      setUrl(data.secure_url);
      setStatus("Image uploaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-ink/20 bg-sand/40 p-4">
      <input type="hidden" name="featuredImageUrl" value={url} />
      {url ? <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-ink/10"><Image src={url} alt="Uploaded preview" fill priority loading="eager" className="object-cover" sizes="500px" /></div> : null}
      <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2 file:text-sm file:font-black file:text-paper hover:file:bg-rust" />
      {status ? <p className="mt-3 text-sm font-bold text-ink/60">{status}</p> : null}
      <p className="mt-2 text-xs text-ink/45">Uploads use the required Media API multipart field named <strong>file</strong>.</p>
    </div>
  );
}
