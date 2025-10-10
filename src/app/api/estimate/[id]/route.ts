// app/api/estimate/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParamsPromise = Promise<{ id: string }>;

export async function POST(req: NextRequest, ctx: { params: ParamsPromise }) {
  // Auth (requires NextAuth module augmentation so user.id/role exist)
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await params
  const { id } = await ctx.params;

  // Parse form-data
  const form = await req.formData();
  const amountPKRRaw = form.get("amountPKR");
  const breakdownRaw = form.get("breakdown");

  const amountPKR = amountPKRRaw ? Number(amountPKRRaw) : 0;
  const breakdown = typeof breakdownRaw === "string" ? breakdownRaw : "";

  if (!Number.isFinite(amountPKR) || amountPKR < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Fetch submission
  const s = await prisma.visitorSubmission.findUnique({ where: { id } });
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hadEstimate =
    (await prisma.estimate.findUnique({
      where: { submissionId: s.id },
      select: { submissionId: true },
    })) != null;

  // Upsert estimate + mark ESTIMATED
  await prisma.$transaction(async (tx) => {
    await tx.estimate.upsert({
      where: { submissionId: s.id },
      update: {
        amountPKR,
        breakdown,
        createdByUserId: session.user.id || "admin",
      },
      create: {
        submissionId: s.id,
        amountPKR,
        breakdown,
        createdByUserId: session.user.id || "admin",
      },
    });

    await tx.visitorSubmission.update({
      where: { id: s.id },
      data: { status: "ESTIMATED" },
    });
  });

  // Notify n8n (optional)
  const webhookUrl = process.env.N8N_ESTIMATE_READY_WEBHOOK_URL;
  if (webhookUrl) {
    const timeoutMs = 2500;
    const timeout = new Promise((resolve) =>
      setTimeout(resolve, timeoutMs, "timeout")
    );

    const payload = {
      submissionId: s.id,
      fullName: s.fullName,
      email: s.email,
      amountPKR,
      breakdown,
      submission: {
        propertyType: s.propertyType,
        location: s.location,
        timeline: s.timeline,
        budgetRange: s.budgetRange,
        plotSize: s.plotSize,
        coveredArea: s.coveredArea,
        floors: s.floors,
        fileUrl: s.fileUrl,
        fileName: s.fileName,
      },
      estimatedByUserId: session.user.id || "admin",
      estimatedAt: new Date().toISOString(),
      isFirstEstimate: !hadEstimate,
    };

    try {
      await Promise.race([
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        timeout,
      ]);

      if (process.env.NODE_ENV !== "production") {
        console.log("[n8n] estimate-ready ping sent", {
          url: webhookUrl,
          first: !hadEstimate,
        });
      }
    } catch (err) {
      console.error("[n8n] estimate-ready failed:", err);
    }
  }

  // Redirect with ?sent=1 to show banner
  const url = new URL(`/admin/submissions/${s.id}`, req.url);
  url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, { status: 303 });
}
