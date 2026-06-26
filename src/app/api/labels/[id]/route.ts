// 📁 src/app/api/labels/[id]/route.ts

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, unauthorized, notFound } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET /api/labels/:id ───
export const GET = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const label = await prisma.label.findFirst({
      where: { id, userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            ingredients: true,
            warnings: true,
            mainImage: true,
            price: true,
            sku: true,
            barcode: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            width: true,
            height: true,
            layout: true,
          },
        },
        qrCode: {
          select: {
            id: true,
            targetUrl: true,
            scanCount: true,
          },
        },
        productPage: {
          select: {
            id: true,
            slug: true,
            isActive: true,
            viewCount: true,
          },
        },
      },
    });

    if (!label) return notFound("Label not found");

    return ok(label);
  },
);

// ─── PUT /api/labels/:id ───
const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  designData: z.any().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  paperSize: z.enum(["A4", "LETTER", "A3", "CUSTOM"]).optional(),
  printQuantity: z.number().min(1).max(100).optional(),
  includeQR: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const PUT = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await getBody(req);
    const result = validate(updateLabelSchema, body);
    if (!result.success) return result.response;

    const existing = await prisma.label.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Label not found");

    const label = await prisma.label.update({
      where: { id },
      data: result.data,
      include: {
        product: {
          select: { id: true, name: true, mainImage: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });

    return ok(label, "Label updated");
  },
);

// ─── DELETE /api/labels/:id ───
export const DELETE = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const existing = await prisma.label.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Label not found");

    // Archive instead of delete (soft delete)
    await prisma.label.update({
      where: { id },
      data: { isArchived: true, status: "ARCHIVED" },
    });

    return ok(null, "Label archived");
  },
);