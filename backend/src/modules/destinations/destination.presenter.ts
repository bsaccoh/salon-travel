import { Destination } from '@prisma/client';

export interface PresentedDestination {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function destinationPresenter(dest: Destination | any): PresentedDestination {
  return {
    id: dest.id,
    name: dest.name,
    slug: dest.slug,
    description: dest.description,
    region: dest.region,
    category: dest.category,
    latitude: dest.latitude ? Number(dest.latitude) : null,
    longitude: dest.longitude ? Number(dest.longitude) : null,
    coverImageUrl: dest.coverImageUrl || null,
    galleryUrls: dest.galleryUrls || [],
    isFeatured: Boolean(dest.isFeatured),
    viewCount: Number(dest.viewCount || 0),
    createdAt: dest.createdAt,
    updatedAt: dest.updatedAt,
  };
}

export function destinationListPresenter(items: (Destination | any)[]): PresentedDestination[] {
  return items.map(destinationPresenter);
}
