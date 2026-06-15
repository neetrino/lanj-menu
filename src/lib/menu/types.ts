export type MenuItemPayload = {
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
};

export type MenuViewMode = 'cards' | 'text';

export type MenuCategoryPayload = {
  slug: string;
  title: string;
  items: MenuItemPayload[];
};

export type MenuSectionPayload = {
  slug: string;
  title: string;
  categories: MenuCategoryPayload[];
};

export type MenuPayload = {
  sections: MenuSectionPayload[];
};
