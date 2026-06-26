// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  AccountStatus,
  RelationType,
  LabelStatus,
  ErrorLevel,
  PaperSize,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log("🌱 Starting seed...");
  
  // Test connection first
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Clean existing data in correct order (respecting foreign keys)
  console.log("🧹 Cleaning existing data...");
  
  const deleteOperations = [
    prisma.productFeedback.deleteMany(),
    prisma.productPage.deleteMany(),
    prisma.qRScan.deleteMany(),
    prisma.qRCode.deleteMany(),
    prisma.label.deleteMany(),
    prisma.relatedProduct.deleteMany(),
    prisma.customField.deleteMany(),
    prisma.template.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ];

  for (const operation of deleteOperations) {
    await operation;
  }
  console.log("✅ Existing data cleaned");

  // ============================================
  // CREATE USERS
  // ============================================

  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "sarah@organichome.com",
      passwordHash,
      name: "Sarah Johnson",
      companyName: "Organic Home Essentials",
      companyLogo:
        "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=200",
      companyWebsite: "https://organichome.com",
      companyDescription:
        "Sustainable and organic home products for eco-conscious families",
      role: UserRole.USER,
      accountStatus: AccountStatus.ACTIVE,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "mike@craftbrewing.com",
      passwordHash,
      name: "Mike Chen",
      companyName: "Craft Brewing Co.",
      companyLogo:
        "https://images.unsplash.com/photo-1571767454098-246b94fbcf70?w=200",
      companyWebsite: "https://craftbrewing.com",
      companyDescription:
        "Small-batch craft beverages made with locally sourced ingredients",
      role: UserRole.USER,
      accountStatus: AccountStatus.ACTIVE,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@labelgen.com",
      passwordHash,
      name: "Admin User",
      companyName: "LabelGen",
      companyLogo:
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
      role: UserRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
    },
  });

  console.log("✅ Users created (3)");

  // ============================================
  // CREATE CATEGORIES
  // ============================================

  console.log("📂 Creating categories...");

  const homeCleaning = await prisma.category.create({
    data: {
      userId: user1.id,
      name: "Home Cleaning",
      slug: "home-cleaning",
      description: "Eco-friendly cleaning products",
    },
  });

  const laundry = await prisma.category.create({
    data: {
      userId: user1.id,
      name: "Laundry",
      slug: "laundry",
      description: "Natural laundry care",
    },
  });

  const kitchen = await prisma.category.create({
    data: {
      userId: user1.id,
      name: "Kitchen",
      slug: "kitchen",
      description: "Kitchen essentials",
    },
  });

  const surfaceCleaners = await prisma.category.create({
    data: {
      userId: user1.id,
      name: "Surface Cleaners",
      slug: "surface-cleaners",
      description: "Multi-surface cleaning solutions",
      parentId: homeCleaning.id,
    },
  });

  const craftBeer = await prisma.category.create({
    data: {
      userId: user2.id,
      name: "Craft Beer",
      slug: "craft-beer",
      description: "Small-batch craft beers",
    },
  });

  const kombucha = await prisma.category.create({
    data: {
      userId: user2.id,
      name: "Kombucha",
      slug: "kombucha",
      description: "Fermented tea beverages",
    },
  });

  const seasonal = await prisma.category.create({
    data: {
      userId: user2.id,
      name: "Seasonal Brews",
      slug: "seasonal-brews",
      description: "Limited edition seasonal beverages",
      parentId: craftBeer.id,
    },
  });

  console.log("✅ Categories created (7)");

  // ============================================
  // CREATE PRODUCTS
  // ============================================

  console.log("📦 Creating products...");

  const lavenderCleaner = await prisma.product.create({
    data: {
      userId: user1.id,
      categoryId: surfaceCleaners.id,
      name: "Lavender All-Purpose Cleaner",
      slug: "lavender-all-purpose-cleaner",
      sku: "OH-LAV-001",
      barcode: "8901234567890",
      description:
        "A gentle yet effective all-purpose cleaner infused with pure lavender essential oil. Perfect for countertops, tables, and other hard surfaces.",
      shortDescription: "Natural lavender-scented multi-surface cleaner",
      price: 12.99,
      usageInstructions:
        "1. Shake well before use\n2. Spray directly onto surface\n3. Wipe clean with a microfiber cloth\n4. No need to rinse\n\nFor tough stains, let sit for 2-3 minutes before wiping.",
      ingredients:
        "Purified Water, Plant-Based Surfactants, Lavender Essential Oil, Citric Acid, Sodium Bicarbonate, Natural Preservatives",
      warnings:
        "Keep out of reach of children. Avoid contact with eyes. If contact occurs, rinse thoroughly with water. Do not ingest.",
      specifications: {
        size: "500ml",
        dimensions: "22cm x 7cm x 7cm",
        weight: "550g",
        shelfLife: "24 months",
        pH: "7.0-7.5",
      },
      mainImage:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600",
      gallery: [
        "https://images.unsplash.com/photo-1585421514738-017b28f1fdf4?w=600",
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600",
      ],
      seoTitle: "Lavender All-Purpose Cleaner | Organic Home Essentials",
      seoDescription:
        "Natural lavender all-purpose cleaner made with plant-based ingredients. Safe for most surfaces, eco-friendly, and beautifully scented.",
      isActive: true,
    },
  });

  const laundryDetergent = await prisma.product.create({
    data: {
      userId: user1.id,
      categoryId: laundry.id,
      name: "Gentle Laundry Detergent",
      slug: "gentle-laundry-detergent",
      sku: "OH-LAU-001",
      barcode: "8901234567891",
      description:
        "Plant-based laundry detergent that's tough on stains but gentle on sensitive skin. Unscented and hypoallergenic.",
      shortDescription: "Hypoallergenic plant-based laundry detergent",
      price: 18.99,
      usageInstructions:
        "1. Sort laundry by color and fabric type\n2. Add 30ml for regular loads, 45ml for heavy loads\n3. Pour into detergent compartment\n4. Wash according to garment care labels\n\nSuitable for both top and front-loading machines.",
      ingredients:
        "Plant-Derived Surfactants, Sodium Carbonate, Sodium Percarbonate, Enzymes, Natural Water Softeners",
      warnings:
        "Keep away from children and pets. If ingested, seek medical attention immediately. May cause eye irritation.",
      specifications: {
        size: "1L",
        dimensions: "25cm x 8cm x 8cm",
        weight: "1100g",
        loads: "33 loads",
        suitableFor: "All water temperatures",
      },
      mainImage:
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600",
      gallery: [
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600",
        "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600",
      ],
      seoTitle:
        "Gentle Laundry Detergent | Hypoallergenic | Organic Home Essentials",
      seoDescription:
        "Plant-based hypoallergenic laundry detergent. Perfect for sensitive skin, effective on stains, and environmentally friendly.",
      isActive: true,
    },
  });

  const dishSoap = await prisma.product.create({
    data: {
      userId: user1.id,
      categoryId: kitchen.id,
      name: "Lemon Dish Soap",
      slug: "lemon-dish-soap",
      sku: "OH-KIT-001",
      barcode: "8901234567892",
      description:
        "Powerful grease-cutting dish soap with fresh lemon scent. Tough on dishes, gentle on hands.",
      shortDescription: "Natural lemon dish soap with grease-cutting power",
      price: 8.99,
      usageInstructions:
        "1. Add a small amount to wet sponge or directly to dishes\n2. Scrub dishes thoroughly\n3. Rinse with clean water\n4. For baked-on food, soak dishes in warm soapy water for 10 minutes",
      ingredients:
        "Water, Coconut-Derived Surfactants, Lemon Essential Oil, Aloe Vera Extract, Vitamin E, Salt",
      warnings:
        "Avoid eye contact. Keep out of reach of children. For external use only.",
      specifications: {
        size: "400ml",
        dimensions: "18cm x 6cm x 6cm",
        weight: "450g",
        scent: "Fresh Lemon",
        biodegradable: true,
      },
      mainImage:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600",
      gallery: [
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600",
        "https://images.unsplash.com/photo-1595425964272-152f5c52bee4?w=600",
      ],
      seoTitle: "Lemon Dish Soap | Natural Grease-Cutting Formula",
      seoDescription:
        "Natural lemon-scented dish soap that cuts through grease while being gentle on hands. Eco-friendly and biodegradable.",
      isActive: true,
    },
  });

  const ipa = await prisma.product.create({
    data: {
      userId: user2.id,
      categoryId: craftBeer.id,
      name: "Hoppy Trails IPA",
      slug: "hoppy-trails-ipa",
      sku: "CB-IPA-001",
      barcode: "8901234567893",
      description:
        "A bold and adventurous IPA with tropical fruit notes and a smooth, bitter finish. Brewed with Citra and Mosaic hops.",
      shortDescription: "Bold tropical IPA with Citra & Mosaic hops",
      price: 8.99,
      usageInstructions:
        "1. Chill to 45-50°F (7-10°C)\n2. Pour slowly into a tulip glass\n3. Leave sediment in the bottle\n4. Enjoy within 3 months of canning date\n\nPairs well with spicy foods, grilled meats, and sharp cheeses.",
      ingredients: "Water, Barley Malt, Hops (Citra, Mosaic), Yeast",
      warnings:
        "Contains gluten. Must be 21+ to purchase and consume. Please drink responsibly.",
      specifications: {
        size: "473ml",
        abv: "7.2%",
        ibu: "65",
        style: "American IPA",
        canningDate: "2024-01-15",
      },
      mainImage:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=600",
      gallery: [
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=600",
        "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600",
      ],
      seoTitle: "Hoppy Trails IPA | Craft Brewing Co.",
      seoDescription:
        "Bold tropical IPA with Citra and Mosaic hops. 7.2% ABV with notes of mango, passionfruit, and pine.",
      isActive: true,
    },
  });

  const gingerKombucha = await prisma.product.create({
    data: {
      userId: user2.id,
      categoryId: kombucha.id,
      name: "Ginger Fire Kombucha",
      slug: "ginger-fire-kombucha",
      sku: "CB-KOM-001",
      barcode: "8901234567894",
      description:
        "A spicy and refreshing kombucha with fresh-pressed ginger and a hint of turmeric. Naturally fermented for 14 days.",
      shortDescription: "Spicy ginger kombucha with turmeric",
      price: 5.99,
      usageInstructions:
        "1. Keep refrigerated\n2. Gently turn bottle to mix\n3. Open slowly to release pressure\n4. Pour carefully, leaving sediment in bottle\n\nBest enjoyed within 2 days of opening.",
      ingredients:
        "Filtered Water, Organic Black Tea, Organic Cane Sugar, Fresh Ginger, Turmeric, Kombucha Culture",
      warnings:
        "Contains trace amounts of alcohol (<0.5%). Naturally carbonated - open with care. Keep refrigerated.",
      specifications: {
        size: "355ml",
        fermentation: "14 days",
        sugar: "4g per serving",
        probiotics: "Live cultures",
        organic: true,
      },
      mainImage:
        "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=600",
      gallery: [
        "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=600",
        "https://images.unsplash.com/photo-1543363136-21b47b23e20b?w=600",
      ],
      seoTitle: "Ginger Fire Kombucha | Live Probiotic Drink",
      seoDescription:
        "Fresh-pressed ginger and turmeric kombucha. Naturally fermented, probiotic-rich, and refreshingly spicy.",
      isActive: true,
    },
  });

  console.log("✅ Products created (5)");

  // ============================================
  // CREATE RELATED PRODUCTS
  // ============================================

  console.log("🔗 Creating related products...");

  await prisma.relatedProduct.createMany({
    data: [
      {
        productId: lavenderCleaner.id,
        relatedId: dishSoap.id,
        relationType: RelationType.COMPLEMENTARY,
        sortOrder: 0,
      },
      {
        productId: lavenderCleaner.id,
        relatedId: laundryDetergent.id,
        relationType: RelationType.COMPLEMENTARY,
        sortOrder: 1,
      },
      {
        productId: dishSoap.id,
        relatedId: lavenderCleaner.id,
        relationType: RelationType.COMPLEMENTARY,
        sortOrder: 0,
      },
      {
        productId: laundryDetergent.id,
        relatedId: lavenderCleaner.id,
        relationType: RelationType.COMPLEMENTARY,
        sortOrder: 0,
      },
      {
        productId: ipa.id,
        relatedId: gingerKombucha.id,
        relationType: RelationType.ALTERNATIVE,
        sortOrder: 0,
      },
      {
        productId: gingerKombucha.id,
        relatedId: ipa.id,
        relationType: RelationType.ALTERNATIVE,
        sortOrder: 0,
      },
    ],
  });

  console.log("✅ Related products created (6)");

  // ============================================
  // CREATE CUSTOM FIELDS
  // ============================================

  console.log("📝 Creating custom fields...");

  await prisma.customField.createMany({
    data: [
      {
        productId: ipa.id,
        name: "Hops Varieties",
        value: "Citra, Mosaic, Cascade",
        type: "TEXT",
        displayOrder: 0,
      },
      {
        productId: ipa.id,
        name: "Malt Bill",
        value: "2-Row, Munich, Crystal 40",
        type: "TEXT",
        displayOrder: 1,
      },
      {
        productId: gingerKombucha.id,
        name: "Brewing Method",
        value: "Small-batch fermentation",
        type: "TEXT",
        displayOrder: 0,
      },
      {
        productId: lavenderCleaner.id,
        name: "Eco Certification",
        value: "USDA Certified Biobased",
        type: "TEXT",
        displayOrder: 0,
      },
    ],
  });

  console.log("✅ Custom fields created (4)");

  // ============================================
  // CREATE TEMPLATES
  // ============================================

  console.log("🏷️  Creating templates...");

  const cleaningLabelTemplate = await prisma.template.create({
    data: {
      userId: user1.id,
      name: "Cleaning Product Label",
      description: "Standard label template for cleaning products",
      width: 80,
      height: 120,
      margin: 3,
      layout: {
        version: "1.0",
        elements: [
          {
            id: "company-logo",
            type: "IMAGE",
            x: 10,
            y: 10,
            width: 60,
            height: 30,
            config: {
              source: "{{company.logo}}",
              fit: "contain",
            },
          },
          {
            id: "product-name",
            type: "TEXT",
            x: 10,
            y: 45,
            width: 60,
            height: 20,
            config: {
              content: "{{product.name}}",
              fontSize: 14,
              fontWeight: "bold",
              color: "#2D3748",
              align: "center",
            },
          },
          {
            id: "product-description",
            type: "TEXT",
            x: 10,
            y: 65,
            width: 60,
            height: 15,
            config: {
              content: "{{product.shortDescription}}",
              fontSize: 8,
              color: "#718096",
              align: "center",
            },
          },
          {
            id: "ingredients",
            type: "TEXT",
            x: 10,
            y: 82,
            width: 60,
            height: 10,
            config: {
              content: "{{product.ingredients}}",
              fontSize: 6,
              color: "#A0AEC0",
              align: "left",
              maxLines: 2,
            },
          },
          {
            id: "qr-code",
            type: "QRCODE",
            x: 25,
            y: 95,
            width: 30,
            height: 30,
            config: {
              size: 150,
              errorCorrection: "M",
              color: "#2D3748",
            },
          },
        ],
      },
      isDefault: true,
      tags: ["cleaning", "eco-friendly", "home"],
      thumbnail:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200",
    },
  });

  const beerLabelTemplate = await prisma.template.create({
    data: {
      userId: user2.id,
      name: "Craft Beer Can Label",
      description: "Bold label design for craft beer cans",
      width: 210,
      height: 90,
      margin: 2,
      layout: {
        version: "1.0",
        elements: [
          {
            id: "beer-name",
            type: "TEXT",
            x: 20,
            y: 15,
            width: 170,
            height: 25,
            config: {
              content: "{{product.name}}",
              fontSize: 20,
              fontWeight: "bold",
              color: "#1A202C",
              align: "left",
              fontFamily: "Impact",
            },
          },
          {
            id: "beer-style",
            type: "TEXT",
            x: 20,
            y: 40,
            width: 100,
            height: 12,
            config: {
              content: "{{product.specifications.style}}",
              fontSize: 9,
              color: "#E53E3E",
              align: "left",
              textTransform: "uppercase",
            },
          },
          {
            id: "abv-info",
            type: "TEXT",
            x: 20,
            y: 55,
            width: 50,
            height: 15,
            config: {
              content: "ABV: {{product.specifications.abv}}",
              fontSize: 8,
              color: "#4A5568",
              align: "left",
            },
          },
          {
            id: "ibu-info",
            type: "TEXT",
            x: 80,
            y: 55,
            width: 50,
            height: 15,
            config: {
              content: "IBU: {{product.specifications.ibu}}",
              fontSize: 8,
              color: "#4A5568",
              align: "left",
            },
          },
          {
            id: "qr-code",
            type: "QRCODE",
            x: 170,
            y: 10,
            width: 25,
            height: 25,
            config: {
              size: 200,
              errorCorrection: "H",
              color: "#1A202C",
            },
          },
          {
            id: "warning",
            type: "TEXT",
            x: 20,
            y: 73,
            width: 170,
            height: 8,
            config: {
              content: "Contains gluten. Drink responsibly. 21+",
              fontSize: 6,
              color: "#A0AEC0",
              align: "center",
            },
          },
        ],
      },
      isDefault: true,
      tags: ["beer", "craft", "beverage"],
      thumbnail:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=200",
    },
  });

  const kombuchaLabelTemplate = await prisma.template.create({
    data: {
      userId: user2.id,
      name: "Kombucha Bottle Label",
      description: "Fresh and natural label design for kombucha bottles",
      width: 70,
      height: 140,
      margin: 3,
      layout: {
        version: "1.0",
        elements: [
          {
            id: "brand-banner",
            type: "IMAGE",
            x: 5,
            y: 5,
            width: 60,
            height: 25,
            config: {
              source: "{{company.logo}}",
              fit: "contain",
            },
          },
          {
            id: "flavor-name",
            type: "TEXT",
            x: 10,
            y: 35,
            width: 50,
            height: 20,
            config: {
              content: "{{product.name}}",
              fontSize: 12,
              fontWeight: "bold",
              color: "#276749",
              align: "center",
            },
          },
          {
            id: "health-claims",
            type: "TEXT",
            x: 10,
            y: 55,
            width: 50,
            height: 25,
            config: {
              content:
                "Live Probiotics\nNaturally Fermented\nOrganic Ingredients",
              fontSize: 6,
              color: "#38A169",
              align: "center",
              lineHeight: 1.5,
            },
          },
          {
            id: "ingredients",
            type: "TEXT",
            x: 10,
            y: 85,
            width: 50,
            height: 15,
            config: {
              content: "{{product.ingredients}}",
              fontSize: 5,
              color: "#718096",
              align: "left",
            },
          },
          {
            id: "qr-code",
            type: "QRCODE",
            x: 20,
            y: 105,
            width: 30,
            height: 30,
            config: {
              size: 150,
              errorCorrection: "M",
              color: "#276749",
            },
          },
        ],
      },
      isDefault: false,
      tags: ["kombucha", "natural", "beverage", "healthy"],
      thumbnail:
        "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=200",
    },
  });

  console.log("✅ Templates created (3)");

  // ============================================
  // CREATE QR CODES
  // ============================================

  console.log("📱 Creating QR codes...");

  const qrCode1 = await prisma.qRCode.create({
    data: {
      targetUrl: "https://labels.organichome.com/p/lavender-cleaner",
      shortUrl: "https://lbl.gen/x7Kp2",
      design: {
        foreground: "#2D3748",
        background: "#FFFFFF",
        shape: "square",
        includeLogo: true,
        logoSize: 0.25,
      },
      errorCorrection: ErrorLevel.M,
      size: 300,
      isActive: true,
    },
  });

  const qrCode2 = await prisma.qRCode.create({
    data: {
      targetUrl: "https://labels.craftbrewing.com/p/hoppy-trails-ipa",
      shortUrl: "https://lbl.gen/m3Nq8",
      design: {
        foreground: "#1A202C",
        background: "#FFFFFF",
        shape: "rounded",
        includeLogo: true,
        logoSize: 0.3,
      },
      errorCorrection: ErrorLevel.H,
      size: 350,
      isActive: true,
    },
  });

  const qrCode3 = await prisma.qRCode.create({
    data: {
      targetUrl: "https://labels.craftbrewing.com/p/ginger-fire-kombucha",
      shortUrl: "https://lbl.gen/r4Wx9",
      design: {
        foreground: "#276749",
        background: "#F0FFF4",
        shape: "dots",
        includeLogo: false,
      },
      errorCorrection: ErrorLevel.M,
      size: 250,
      isActive: true,
    },
  });

  console.log("✅ QR Codes created (3)");

  // ============================================
  // CREATE LABELS
  // ============================================

  console.log("🏷️  Creating labels...");

  const label1 = await prisma.label.create({
    data: {
      userId: user1.id,
      templateId: cleaningLabelTemplate.id,
      productId: lavenderCleaner.id,
      name: "Lavender Cleaner - Main Label",
      designData: {
        merged: true,
        template: "cleaning-product-label",
        customizations: {
          colors: {
            primary: "#6B46C1",
            secondary: "#D6BCFA",
          },
        },
      },
      thumbnail:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400",
      pdfUrl: "https://example.com/labels/lavender-cleaner.pdf",
      imageUrl:
        "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800",
      status: LabelStatus.ACTIVE,
      qrCodeId: qrCode1.id,
      includeQR: true,
    },
  });

  const label2 = await prisma.label.create({
    data: {
      userId: user2.id,
      templateId: beerLabelTemplate.id,
      productId: ipa.id,
      name: "Hoppy Trails IPA - Can Label",
      designData: {
        merged: true,
        template: "craft-beer-can-label",
        customizations: {
          colors: {
            primary: "#DD6B20",
            secondary: "#F6AD55",
          },
        },
      },
      thumbnail:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400",
      pdfUrl: "https://example.com/labels/hoppy-trails.pdf",
      imageUrl:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800",
      status: LabelStatus.ACTIVE,
      qrCodeId: qrCode2.id,
      includeQR: true,
      printQuantity: 1000,
      paperSize: PaperSize.A4,
    },
  });

  const label3 = await prisma.label.create({
    data: {
      userId: user2.id,
      templateId: kombuchaLabelTemplate.id,
      productId: gingerKombucha.id,
      name: "Ginger Fire - Bottle Label",
      designData: {
        merged: true,
        template: "kombucha-bottle-label",
        customizations: {
          colors: {
            primary: "#276749",
            secondary: "#9AE6B4",
          },
        },
      },
      thumbnail:
        "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=400",
      status: LabelStatus.DRAFT,
      qrCodeId: qrCode3.id,
      includeQR: true,
    },
  });

  console.log("✅ Labels created (3)");

  // ============================================
  // CREATE PRODUCT PAGES
  // ============================================

  console.log("📄 Creating product pages...");

  const productPage1 = await prisma.productPage.create({
    data: {
      labelId: label1.id,
      slug: "lavender-cleaner",
      isActive: true,
      theme: {
        colors: {
          primary: "#6B46C1",
          background: "#FAF5FF",
          text: "#2D3748",
        },
        fontFamily: "Inter, sans-serif",
      },
      showProductInfo: true,
      showHowToUse: true,
      showIngredients: true,
      showWarnings: true,
      showRelated: true,
      showGallery: true,
      seoTitle: "Lavender All-Purpose Cleaner | Product Information",
      seoDescription:
        "Learn about our natural lavender cleaner, how to use it, ingredients, and discover related eco-friendly products.",
      showFeedback: true,
      showShareButtons: true,
    },
  });

  const productPage2 = await prisma.productPage.create({
    data: {
      labelId: label2.id,
      slug: "hoppy-trails-ipa",
      isActive: true,
      theme: {
        colors: {
          primary: "#DD6B20",
          background: "#FFFAF0",
          text: "#1A202C",
        },
        fontFamily: "Roboto, sans-serif",
      },
      showProductInfo: true,
      showHowToUse: true,
      showIngredients: true,
      showWarnings: true,
      showRelated: true,
      showGallery: true,
      customSections: {
        breweryStory: {
          title: "The Story Behind This Brew",
          content:
            "Inspired by our head brewer's trek through the Pacific Northwest, Hoppy Trails combines the best of West Coast and New England IPA styles.",
        },
        foodPairings: {
          title: "Perfect Pairings",
          items: [
            "Spicy Thai Curry",
            "Blue Cheese Burger",
            "Grilled Pineapple",
          ],
        },
      },
      seoTitle: "Hoppy Trails IPA | Craft Brewing Co. | Product Details",
      seoDescription:
        "Discover the story behind our Hoppy Trails IPA, brewing notes, food pairings, and more. 7.2% ABV, 65 IBU.",
      showFeedback: true,
      showShareButtons: true,
    },
  });

  console.log("✅ Product pages created (2)");

  // ============================================
  // CREATE QR SCANS
  // ============================================

  console.log("📊 Creating QR scans...");

  const scanData = [
    {
      qrCodeId: qrCode1.id,
      country: "United States",
      city: "Portland",
      region: "Oregon",
      deviceType: "mobile",
      browser: "Chrome",
      os: "iOS",
    },
    {
      qrCodeId: qrCode1.id,
      country: "United States",
      city: "Seattle",
      region: "Washington",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS",
    },
    {
      qrCodeId: qrCode1.id,
      country: "Canada",
      city: "Vancouver",
      region: "British Columbia",
      deviceType: "tablet",
      browser: "Chrome",
      os: "Android",
    },
    {
      qrCodeId: qrCode2.id,
      country: "United States",
      city: "Denver",
      region: "Colorado",
      deviceType: "mobile",
      browser: "Chrome",
      os: "Android",
    },
    {
      qrCodeId: qrCode2.id,
      country: "United States",
      city: "Austin",
      region: "Texas",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS",
    },
    {
      qrCodeId: qrCode2.id,
      country: "United States",
      city: "San Diego",
      region: "California",
      deviceType: "mobile",
      browser: "Firefox",
      os: "Android",
    },
    {
      qrCodeId: qrCode2.id,
      country: "United Kingdom",
      city: "London",
      region: "England",
      deviceType: "mobile",
      browser: "Chrome",
      os: "Android",
    },
    {
      qrCodeId: qrCode3.id,
      country: "United States",
      city: "Portland",
      region: "Oregon",
      deviceType: "mobile",
      browser: "Chrome",
      os: "iOS",
    },
  ];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  for (let i = 0; i < scanData.length; i++) {
    const scan = scanData[i];
    await prisma.qRScan.create({
      data: {
        ...scan,
        scannedAt: i < 3 ? twoDaysAgo : yesterday,
        referrer: i % 2 === 0 ? "label" : "direct",
        source: i % 3 === 0 ? "social" : "label",
      },
    });
  }

  // Update scan counts
  await prisma.qRCode.update({
    where: { id: qrCode1.id },
    data: { scanCount: 3, lastScannedAt: twoDaysAgo },
  });

  await prisma.qRCode.update({
    where: { id: qrCode2.id },
    data: { scanCount: 4, lastScannedAt: yesterday },
  });

  await prisma.qRCode.update({
    where: { id: qrCode3.id },
    data: { scanCount: 1, lastScannedAt: yesterday },
  });

  console.log("✅ QR Scans created (8)");

  // ============================================
  // CREATE PRODUCT FEEDBACK
  // ============================================

  console.log("💬 Creating feedback...");

  await prisma.productFeedback.createMany({
    data: [
      {
        productPageId: productPage1.id,
        rating: 5,
        comment:
          "Love how easy it is to access all the product info. The QR code on the label is brilliant!",
        isHelpful: true,
      },
      {
        productPageId: productPage1.id,
        rating: 4,
        comment: "Great product info, would love to see more cleaning tips.",
        isHelpful: true,
      },
      {
        productPageId: productPage2.id,
        rating: 5,
        comment:
          "The food pairing suggestions were spot on! Had it with Thai curry - amazing.",
        isHelpful: true,
      },
    ],
  });

  console.log("✅ Product feedback created (3)");

  // ============================================
  // SUMMARY
  // ============================================

  console.log("\n📊 Seed Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━");
  console.log(`👥 Users: 3 (2 regular, 1 admin)`);
  console.log(`📂 Categories: 7`);
  console.log(`📦 Products: 5`);
  console.log(`🔗 Related Products: 6`);
  console.log(`📝 Custom Fields: 4`);
  console.log(`🏷️  Templates: 3`);
  console.log(`🏷️  Labels: 3`);
  console.log(`📱 QR Codes: 3`);
  console.log(`📄 Product Pages: 2`);
  console.log(`📊 QR Scans: 8`);
  console.log(`💬 Feedback: 3`);
  console.log("\n🔑 Test Accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━");
  console.log("  sarah@organichome.com");
  console.log("  mike@craftbrewing.com");
  console.log("  admin@labelgen.com");
  console.log("  Password: password123");
  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });