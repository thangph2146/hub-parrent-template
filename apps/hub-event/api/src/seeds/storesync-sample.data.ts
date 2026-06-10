import type { OrderStatus, PaymentStatus } from '../entities/order.entity';
import type { Product } from '../entities/product.entity';

/** Ảnh placeholder — storefront chấp nhận URL ngoài. */
const IMG = {
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
  noodle: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600',
  water: 'https://images.unsplash.com/photo-1548839140-29a7492991ff?w=600',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
  snack: 'https://images.unsplash.com/photo-1558961363-fa8ccf82a521?w=600',
  coffee: 'https://images.unsplash.com/photo-1514434756120-91aae7933b1c?w=600',
} as const;

/**
 * Catalog mẫu theo phong cách StoreSync (B2B FMCG, đa đơn vị, KM + quà).
 * Idempotent theo SKU khi seed.
 */
export const STORESYNC_SAMPLE_PRODUCTS: Array<Partial<Product>> = [
  {
    sku: 'SYNC-MILK-001',
    name: 'Sữa tươi có đường 1L',
    description:
      'Sữa tươi tiệt trùng — phù hợp đại lý tạp hóa, quán cà phê. Giao theo chai hoặc thùng.',
    category: 'Milk',
    brand: 'StoreSync',
    origin: 'Việt Nam',
    retailPrice: 32_000,
    wholesalePrice: 28_000,
    stock: 480,
    unit: 'chai',
    unitTypes: [
      {
        type: 'chai',
        label: 'Chai',
        sku: 'SYNC-MILK-001-CHAI',
        retailPrice: 32_000,
        wholesalePrice: 28_000,
        minWholesaleQty: 12,
        qtyPerUnit: 1,
        stock: 400,
        images: [IMG.milk],
        isDefault: true,
        isActive: true,
      },
      {
        type: 'thung',
        label: 'Thùng (12 chai)',
        sku: 'SYNC-MILK-001-THUNG',
        retailPrice: 360_000,
        wholesalePrice: 310_000,
        minWholesaleQty: 2,
        qtyPerUnit: 12,
        stock: 40,
        images: [IMG.milk],
        priceTiers: [{ minQty: 5, unitPrice: 300_000, label: 'Mua 5+ thùng' }],
        isActive: true,
      },
    ],
    images: [IMG.milk],
    fulfillmentNote:
      '- Từ 24 chai: giao nhanh trong ngày nội thành\n- Thùng: pallet 40 thùng giảm thêm 2%',
    isActive: true,
  },
  {
    sku: 'SYNC-NOODLE-002',
    name: 'Mì gói đại lý (thùng 30 gói)',
    description: 'Mì ăn liền bán sỉ — mix vị, phù hợp cửa hàng tiện lợi.',
    category: 'Soup',
    brand: 'Hảo Hảo',
    origin: 'Việt Nam',
    retailPrice: 4_500,
    wholesalePrice: 3_800,
    stock: 600,
    unit: 'goi',
    unitTypes: [
      {
        type: 'goi',
        label: 'Gói lẻ',
        sku: 'SYNC-NOODLE-002-GOI',
        retailPrice: 4_500,
        wholesalePrice: null,
        minWholesaleQty: 0,
        qtyPerUnit: 1,
        stock: 200,
        images: [IMG.noodle],
        isDefault: true,
      },
      {
        type: 'thung',
        label: 'Thùng 30 gói',
        sku: 'SYNC-NOODLE-002-THUNG',
        retailPrice: 120_000,
        wholesalePrice: 105_000,
        minWholesaleQty: 3,
        qtyPerUnit: 30,
        stock: 80,
        images: [IMG.noodle],
      },
    ],
    images: [IMG.noodle],
    isActive: true,
  },
  {
    sku: 'SYNC-WATER-003',
    name: 'Nước suối 500ml',
    description:
      'Nước khoáng đóng chai — combo quà tặng ly khi mua số lượng lớn.',
    category: 'Droplets',
    brand: 'Aquafina',
    origin: 'Việt Nam',
    retailPrice: 6_000,
    wholesalePrice: 5_000,
    stock: 1200,
    unit: 'chai',
    unitTypes: [
      {
        type: 'chai',
        label: 'Chai',
        sku: 'SYNC-WATER-003-CHAI',
        retailPrice: 6_000,
        wholesalePrice: 5_000,
        minWholesaleQty: 24,
        qtyPerUnit: 1,
        stock: 1000,
        images: [IMG.water],
        giftRules: [
          {
            id: 'gift-ly',
            label: 'Tặng ly nhựa',
            trigger: { scope: 'line', minQty: 48 },
            gift: {
              name: 'Ly nhựa StoreSync',
              sku: 'GIFT-LY-001',
              qty: 1,
              qtyMultiplier: 'once',
            },
          },
        ],
        isDefault: true,
      },
      {
        type: 'thung',
        label: 'Thùng 24 chai',
        sku: 'SYNC-WATER-003-THUNG',
        retailPrice: 130_000,
        wholesalePrice: 110_000,
        minWholesaleQty: 2,
        qtyPerUnit: 24,
        stock: 50,
        images: [IMG.water],
      },
    ],
    images: [IMG.water],
    fulfillmentNote: '- Từ 48 chai: tặng 1 ly nhựa StoreSync (1 lần/đơn)',
    isActive: true,
  },
  {
    sku: 'SYNC-RICE-004',
    name: 'Gạo ST25 túi 5kg',
    description: 'Gạo thơm ST25 — hàng chủ lực kênh đại lý miền Nam.',
    category: 'Wheat',
    brand: 'ST25',
    origin: 'Sóc Trăng',
    retailPrice: 185_000,
    wholesalePrice: 168_000,
    stock: 200,
    unit: 'tui',
    unitTypes: [
      {
        type: 'tui',
        label: 'Túi 5kg',
        sku: 'SYNC-RICE-004-TUI',
        retailPrice: 185_000,
        wholesalePrice: 168_000,
        minWholesaleQty: 5,
        qtyPerUnit: 1,
        stock: 150,
        images: [IMG.rice],
        isDefault: true,
      },
      {
        type: 'bao',
        label: 'Bao 25kg',
        sku: 'SYNC-RICE-004-BAO',
        retailPrice: 880_000,
        wholesalePrice: 820_000,
        minWholesaleQty: 2,
        qtyPerUnit: 5,
        stock: 50,
        images: [IMG.rice],
      },
    ],
    images: [IMG.rice],
    isActive: true,
  },
  {
    sku: 'SYNC-SNACK-005',
    name: 'Bánh quy bơ 300g',
    description: 'Snack cao cấp — bán lẻ & combo quà tết.',
    category: 'Cookie',
    brand: 'StoreSync Select',
    origin: 'Việt Nam',
    retailPrice: 45_000,
    wholesalePrice: 38_000,
    stock: 180,
    unit: 'hop',
    unitTypes: [
      {
        type: 'hop',
        label: 'Hộp',
        sku: 'SYNC-SNACK-005-HOP',
        retailPrice: 45_000,
        wholesalePrice: 38_000,
        minWholesaleQty: 6,
        qtyPerUnit: 1,
        stock: 180,
        images: [IMG.snack],
        isDefault: true,
      },
    ],
    images: [IMG.snack],
    isActive: true,
  },
  {
    sku: 'SYNC-COFFEE-006',
    name: 'Cà phê hòa tan gói 20 stick',
    description: 'Cà phê 3in1 — dòng hot sale storefront.',
    category: 'Coffee',
    brand: 'G7',
    origin: 'Việt Nam',
    retailPrice: 55_000,
    wholesalePrice: 48_000,
    stock: 320,
    unit: 'goi',
    unitTypes: [
      {
        type: 'goi',
        label: 'Gói 20 stick',
        sku: 'SYNC-COFFEE-006-GOI',
        retailPrice: 55_000,
        wholesalePrice: 48_000,
        minWholesaleQty: 10,
        qtyPerUnit: 1,
        stock: 320,
        images: [IMG.coffee],
        isDefault: true,
      },
    ],
    images: [IMG.coffee],
    coupons: ['SYNC10'],
    isActive: true,
  },
  {
    sku: 'DEMO-001',
    name: 'Sản phẩm demo A',
    category: 'general',
    retailPrice: 120_000,
    wholesalePrice: 100_000,
    stock: 50,
    unit: 'hop',
    unitTypes: [
      {
        type: 'hop',
        label: 'Hộp',
        retailPrice: 120_000,
        wholesalePrice: 100_000,
        minWholesaleQty: 2,
        qtyPerUnit: 1,
      },
    ],
    images: [],
    isActive: true,
  },
  {
    sku: 'DEMO-002',
    name: 'Sản phẩm demo B',
    category: 'general',
    retailPrice: 85_000,
    wholesalePrice: 75_000,
    stock: 30,
    unit: 'goi',
    unitTypes: [
      {
        type: 'goi',
        label: 'Gói',
        retailPrice: 85_000,
        wholesalePrice: 75_000,
        minWholesaleQty: 3,
        qtyPerUnit: 1,
      },
    ],
    images: [],
    isActive: true,
  },
];

export type StoreSyncOrderLineSeed = {
  productSku: string;
  unitType: string;
  quantity: number;
};

export type StoreSyncOrderSeed = {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  lines: StoreSyncOrderLineSeed[];
  couponCode?: string | null;
  discountAmount?: number;
  shippingFee?: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  isPaid?: boolean;
  notes?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
};

export const STORESYNC_SAMPLE_ORDERS: StoreSyncOrderSeed[] = [
  {
    orderNumber: 'SS-ORD-2026-0001',
    customerEmail: 'student@hub.edu.vn',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0123456789',
    shippingAddress: 'Khu phố 6, Thủ Đức, TP.HCM',
    lines: [
      { productSku: 'SYNC-MILK-001', unitType: 'chai', quantity: 24 },
      { productSku: 'SYNC-NOODLE-002', unitType: 'thung', quantity: 2 },
    ],
    status: 'pending',
    paymentStatus: 'unpaid',
    isPaid: false,
    shippingFee: 30_000,
    notes: 'Giao giờ hành chính — đơn demo StoreSync.',
  },
  {
    orderNumber: 'SS-ORD-2026-0002',
    customerEmail: 'thang.ph2146@gmail.com',
    customerName: 'Thắng Phạm',
    customerPhone: '0909123456',
    shippingAddress: 'Quận 1, TP.HCM',
    lines: [
      { productSku: 'SYNC-COFFEE-006', unitType: 'goi', quantity: 12 },
      { productSku: 'SYNC-SNACK-005', unitType: 'hop', quantity: 6 },
    ],
    couponCode: 'SYNC10',
    discountAmount: 50_400,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    isPaid: false,
    shippingFee: 25_000,
    notes: 'Áp mã SYNC10 — chờ xác nhận kho.',
  },
  {
    orderNumber: 'SS-ORD-2026-0003',
    customerEmail: 'admin@hub.edu.vn',
    customerName: 'Administrator',
    customerPhone: '02838223344',
    shippingAddress: 'Quận 3, TP.HCM',
    lines: [{ productSku: 'SYNC-WATER-003', unitType: 'chai', quantity: 48 }],
    status: 'delivered',
    paymentStatus: 'paid',
    isPaid: true,
    shippingFee: 0,
    deliveredAt: new Date('2026-06-01T14:30:00+07:00'),
    notes: 'Đơn có quà tặng ly — đã giao.',
  },
  {
    orderNumber: 'SS-ORD-2026-0004',
    customerEmail: 'lamvtt@hub.edu.vn',
    customerName: 'Thanh Lâm',
    customerPhone: '0918765432',
    shippingAddress: 'Bình Thạnh, TP.HCM',
    lines: [
      { productSku: 'SYNC-RICE-004', unitType: 'tui', quantity: 10 },
      { productSku: 'SYNC-MILK-001', unitType: 'thung', quantity: 3 },
    ],
    couponCode: 'GIAM50K',
    discountAmount: 50_000,
    status: 'shipped',
    paymentStatus: 'paid',
    isPaid: true,
    shippingFee: 45_000,
    shippedAt: new Date('2026-06-04T09:00:00+07:00'),
    notes: 'Đơn sỉ gạo + sữa — đang vận chuyển.',
  },
];
