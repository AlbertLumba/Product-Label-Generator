// 📁 src/app/api/labels/route.ts

import { z } from "zod";
import { apiHandler, getBody, getPagination } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, created, unauthorized } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET /api/labels?page=1&limit=10&status=&search=&productId=&templateId= ───
export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const { page, limit, skip } = getPagination(req);
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const productId = searchParams.get("productId") || undefined;
  const templateId = searchParams.get("templateId") || undefined;

  const where: any = {
    userId: user.id,
    isArchived: false,
    ...(status && { status }),
    ...(productId && { productId }),
    ...(templateId && { templateId }),
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [labels, total] = await Promise.all([
    prisma.label.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, mainImage: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.label.count({ where }),
  ]);

  return ok({
    labels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── POST /api/labels ───
const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  templateId: z.string().min(1, "Template is required"),
  productId: z.string().min(1, "Product is required"),
  designData: z.any(),
  paperSize: z.enum(["A4", "LETTER", "A3", "CUSTOM"]).optional(),
  printQuantity: z.number().min(1).max(100).optional(),
  includeQR: z.boolean().optional(),
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const body = await getBody(req);
  const result = validate(createLabelSchema, body);
  if (!result.success) return result.response;

  // Verify template and product belong to user
  const [template, product] = await Promise.all([
    prisma.template.findFirst({
      where: { id: result.data.templateId, userId: user.id },
    }),
    prisma.product.findFirst({
      where: { id: result.data.productId, userId: user.id },
    }),
  ]);

  if (!template) {
    return unauthorized("Template not found");
  }
  if (!product) {
    return unauthorized("Product not found");
  }

  // Create QR code for the label
  const qrCode = await prisma.qRCode.create({
    data: {
      targetUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${product.slug}`,
      size: 300,
      errorCorrection: "M",
      format: "PNG",
    },
  });

  const label = await prisma.label.create({
    data: {
      name: result.data.name,
      userId: user.id,
      templateId: result.data.templateId,
      productId: result.data.productId,
      designData: result.data.designData,
      paperSize: result.data.paperSize || "A4",
      printQuantity: result.data.printQuantity || 1,
      includeQR: result.data.includeQR ?? true,
      qrCodeId: qrCode.id,
      status: "DRAFT",
    },
    include: {
      product: {
        select: { id: true, name: true, mainImage: true },
      },
      template: {
        select: { id: true, name: true },
      },
    },
  });

  return created(label);
});