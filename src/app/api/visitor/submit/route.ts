import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const get = (k: string) => (form.get(k) as string) || "";

    const body = {
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

    const parsed = z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      propertyType: z.string().min(3),
      location: z.string().min(2),
      plotSize: z.string().nullable().optional(),
      coveredArea: z.string().nullable().optional(),
      floors: z.number().int().nullable().optional(),
      timeline: z.string().nullable().optional(),
      budgetRange: z.string().nullable().optional(),
      extraNotes: z.string().nullable().optional(),
    }).parse(body);

    // Handle optional file
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    const file = form.get("file") as File | null;
    if (file && file.size > 0) {
      fileName = file.name;
      // Upload to Vercel Blob
      const uploaded = await put(`submissions/${crypto.randomUUID()}-${file.name}`, file, {
        access: "public",
      });
      fileUrl = uploaded.url;
    }

    await prisma.visitorSubmission.create({
      data: {
        ...parsed,
        fileUrl,
        fileName,
        answersJson: {},
      },
    });

    // TODO: send emails (visitor + admin)
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Bad Request" }, { status: 400 });
  }
}
