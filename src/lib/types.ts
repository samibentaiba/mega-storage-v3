export interface Chamber {
  id: number;
  name: string;
  "active item": number;
  items: {
    name: string;
    wiki_url: string;
  }[];
  status: "active" | "empty";
}

export type StorageData = Chamber[];

export interface CreativeCategory {
  name: string;
  items: {
    name: string;
    wiki_url: string;
    stackable: boolean;
    chamber: string;
  }[];
}
