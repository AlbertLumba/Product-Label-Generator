// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/products/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, unauthorized, notFound } from "@/lib/api/types";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET /api/products/:id ───
export const GET = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, userId: user.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        labels: {
          select: { id: true, name: true, status: true, thumbnail: true },
          orderBy: { createdAt: "desc" },
        },
        relatedProducts: {
          include: {
            related: {
              select: { id: true, name: true, mainImage: true, price: true },
            },
          },
        },
        customFields: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!product) return notFound("Product not found");

    return ok(product);
  },
);

// ─── PUT /api/products/:id ───
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().optional(),
  usageInstructions: z.string().optional(),
  ingredients: z.string().optional(),
  warnings: z.string().optional(),
  specifications: z.any().optional(),
  mainImage: z.string().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const PUT = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const body = await getBody(req);
    const result = validate(updateProductSchema, body);
    if (!result.success) return result.response;

    const existing = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Product not found");

    const product = await prisma.product.update({
      where: { id },
      data: result.data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return ok(product, "Product updated");
  },
);

// ─── DELETE /api/products/:id ───
export const DELETE = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const existing = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Product not found");

    await prisma.product.delete({ where: { id } });

    return ok(null, "Product deleted");
  },
);
