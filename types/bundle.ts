export type BundleItemDTO = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type BundleDTO = {
  id: string;
  name: string;
  description: string | null;
  comboPrice: number;
  isActive: boolean;
  items: BundleItemDTO[];
  /** Sum of each item's normal selling price * quantity — what the customer would pay without the combo. */
  regularTotal: number;
  /** regularTotal - comboPrice, i.e. how much the customer saves. */
  savings: number;
};
