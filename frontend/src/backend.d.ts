import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    concerns: Array<string>;
    imageUrl: string;
    skinType: SkinType;
    category: ProductCategory;
    brand: string;
    price: Price;
    keyIngredients: Array<string>;
    usageInstructions: string;
}
export interface Price {
    currency: Currency;
    amount: number;
}
export interface ProductUpdate {
    name?: string;
    description?: string;
    concerns?: Array<string>;
    imageUrl?: string;
    skinType?: SkinType;
    category?: ProductCategory;
    brand?: string;
    price?: Price;
    keyIngredients?: Array<string>;
    usageInstructions?: string;
}
export type Currency = {
    __kind__: "eur";
    eur: null;
} | {
    __kind__: "gbp";
    gbp: null;
} | {
    __kind__: "jpy";
    jpy: null;
} | {
    __kind__: "usd";
    usd: null;
} | {
    __kind__: "other";
    other: string;
};
export type ProductId = bigint;
export type ProductCategory = {
    __kind__: "sunscreen";
    sunscreen: null;
} | {
    __kind__: "toner";
    toner: null;
} | {
    __kind__: "cleanser";
    cleanser: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "mask";
    mask: null;
} | {
    __kind__: "exfoliator";
    exfoliator: null;
} | {
    __kind__: "serum";
    serum: null;
} | {
    __kind__: "eyeTreatment";
    eyeTreatment: null;
} | {
    __kind__: "moisturizer";
    moisturizer: null;
};
export interface UserProfile {
    skinConcerns: Array<string>;
    name: string;
    skinType?: SkinType;
}
export interface ProductFilter {
    concerns?: string;
    maxPrice?: number;
    searchText?: string;
    currency?: Currency;
    skinType?: SkinType;
    category?: ProductCategory;
    minPrice?: number;
}
export enum SkinType {
    dry = "dry",
    combination = "combination",
    normal = "normal",
    oily = "oily",
    sensitive = "sensitive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: ProductId): Promise<void>;
    filterProducts(filters: ProductFilter): Promise<Array<Product>>;
    getAllCategories(): Promise<Array<ProductCategory>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProductById(id: ProductId): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeActor(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    resetProducts(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(id: ProductId, productUpdate: ProductUpdate): Promise<void>;
}
