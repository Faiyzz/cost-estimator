// app/api/visitor/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  propertyType: z.string().min(3, "Property type required"),
  location: z.string().min(2, "Location required"),
  plotSize: z.string().nullable().optional(),
  coveredArea: z.string().nullable().optional(),
  floors: z.number().int().nullable().optional(),
  timeline: z.string().nullable().optional(),
  budgetRange: z.string().nullable().optional(),
  extraNotes: z.string().nullable().optional(),
});

// Types derived from schema and uploads
type VisitorBody = z.infer<typeof BodySchema>;

type UploadedFileMeta = {
  name: string;
  url: string;
  size: number;
  type: string;
};

type N8nPayload = VisitorBody & {
  submissionId: string; // ← was number
  files: UploadedFileMeta[];
  n8nToken: string;
};


async function postToN8N(payload: N8nPayload): Promise<void> {
  const url = process.env.N8N_ESTIMATE_WEBHOOK_URL;
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s safety timeout

  try {
    await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-n8n-token": process.env.N8N_WEBHOOK_TOKEN || "",
      },
      body: JSON.stringify({ body: payload, headers: {} }),
    });
  } catch (e: unknown) {
    // safe logging without 'any'
    const msg = e instanceof Error ? e.message : String(e);
    console.error("n8n webhook error:", msg);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const get = (k: string) => (form.get(k) as string) || "";

    const body: VisitorBody = {
      fullName: get("fullName"),
      email: get("email"),
      phone: get("phone"),
      propertyType: get("propertyType"),
      location: get("location"),
      plotSize: get("plotSize") || null,
      coveredArea: get("coveredArea") || null,
      floors: form.get("floors") ? Number(form.get("floors")) : null,
      timeline: get("timeline") || null,
      budgetRange: get("budgetRange") || null,
      extraNotes: get("extraNotes") || null,
    };

    const parsed = BodySchema.parse(body);

    // Gather files (multiple)
    const files = form.getAll("files").filter(Boolean) as File[];
    const legacyFile = form.get("file") as File | null;
    if (legacyFile && legacyFile.size > 0) files.push(legacyFile);

    const MAX_FILES = 10;
    const MAX_TOTAL_MB = 200;
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Max ${MAX_FILES} files allowed.` },
        { status: 400 }
      );
    }
    const totalBytes = files.reduce((n, f) => n + (f?.size || 0), 0);
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Total upload limit is ${MAX_TOTAL_MB}MB.` },
        { status: 400 }
      );
    }

    console.log(
      "files meta",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (!file || file.size === 0) return null; // keep skip
        const key = `submissions/${crypto.randomUUID()}-${file.name}`;
        const putRes = await put(key, file, {
          access: "public",
          contentType: file.type || "application/octet-stream",
        });
        return {
          name: file.name,
          url: putRes.url,
          size: file.size,
          type: file.type || "application/octet-stream",
        } satisfies UploadedFileMeta;
      })
    );

    const clean = uploaded.filter(Boolean) as UploadedFileMeta[];
    const first = clean[0] ?? null;

    // Save submission
    const created = await prisma.visitorSubmission.create({
      data: {
        ...parsed,
        filesJson: clean.length ? clean : undefined,
        fileUrl: first ? first.url : null,
        fileName: first ? first.name : null,
        answersJson: {},
      },
    });

    // Fire n8n webhook (non-blocking)
    // (no await) — and payload is fully typed
    postToN8N({
      submissionId: created.id,
      ...parsed,
      files: clean,
      n8nToken: process.env.N8N_WEBHOOK_TOKEN || "",
    });

    return NextResponse.json({ ok: true });
 } catch (e: unknown) {
  console.error(e);
  let message = "Bad Request";

  if (e instanceof z.ZodError) {
    // Option A: read from `issues`
    message = e.issues.map((i) => i.message).join(", ");

    // Option B (alternative): use `flatten()`
    // const flat = e.flatten();
    // message = [...flat.formErrors, ...Object.values(flat.fieldErrors).flat()]
    //   .filter(Boolean)
    //   .join(", ");
  } else if (e instanceof Error) {
    message = e.message;
  }

  return NextResponse.json({ error: message }, { status: 400 });
}
}
