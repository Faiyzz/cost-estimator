import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const amountPKR = Number(form.get("amountPKR") || 0);
  const breakdown = String(form.get("breakdown") || "");

  const s = await prisma.visitorSubmission.findUnique({ where: { id: params.id }});
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.estimate.upsert({
      where: { submissionId: s.id },
      update: { amountPKR, breakdown, createdByUserId: (session.user as any).id || "admin" },
      create: { submissionId: s.id, amountPKR, breakdown, createdByUserId: (session.user as any).id || "admin" },
    });
    await tx.visitorSubmission.update({
      where: { id: s.id },
      data: { status: "ESTIMATED" },
    });
  });

  // TODO: send email to visitor with estimate details
  return NextResponse.redirect(new URL(`/admin/submissions/${s.id}`, req.url));
}
