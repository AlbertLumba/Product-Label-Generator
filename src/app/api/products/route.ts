// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/products/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody, getPagination } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, created, unauthorized, serverError } from "@/lib/api/types";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET /api/products?page=1&limit=10&search=&category= ───
export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const { page, limit, skip } = getPagination(req);
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || undefined;

  const where: any = {
    userId: user.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { labels: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ok({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── POST /api/products ───
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().optional(),
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
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const body = await getBody(req);
  const result = validate(createProductSchema, body);
  if (!result.success) return result.response;

  const product = await prisma.product.create({
    data: {
      ...result.data,
      userId: user.id,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return created(product);
});
