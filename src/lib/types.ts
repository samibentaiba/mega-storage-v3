export interface ChamberItem {
  name: string;
  wiki_url: string;
  chamberSide?: "left" | "right";
  chamberPosition?: number;
}

export interface Chamber {
  id: number;
  name: string;
  "active item": number;
  items: ChamberItem[];
}

export type StorageData = Chamber[];

export interface CreativeCategoryItem {
  name: string;
  wiki_url: string;
  stackable: boolean;
  chamber: string;
  chamberId: number | null;
  chamberItemCount: number | null;
  chamberSide?: "left" | "right";
  chamberPosition?: number;
}

export interface CreativeCategory {
  name: string;
  items: CreativeCategoryItem[];
}
