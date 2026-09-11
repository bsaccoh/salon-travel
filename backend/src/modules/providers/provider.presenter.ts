import { Provider } from '@prisma/client';

export interface PublicProviderDto {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  ratingAverage: number;
  ratingCount: number;
  logoUrl: string | null;
  bannerUrl: string | null;
  galleryUrls: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function providerPresenter(p: Provider | any): PublicProviderDto {
  return {
    id: p.id,
    userId: p.userId,
    businessName: p.businessName,
    slug: p.slug,
    category: p.category,
    description: p.description,
    phone: p.phone,
    address: p.address,
    city: p.city,
    country: p.country,
    ratingAverage: Number(p.ratingAverage || 0),
    ratingCount: Number(p.ratingCount || 0),
    logoUrl: p.logoUrl || null,
    bannerUrl: p.bannerUrl || null,
    galleryUrls: p.galleryUrls || [],
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function providerListPresenter(items: (Provider | any)[]): PublicProviderDto[] {
  return items.map(providerPresenter);
}
