export enum OutfitStyle {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out'
}

export interface OutfitResult {
  id: string;
  style: OutfitStyle;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export type OutfitState = Record<OutfitStyle, OutfitResult>;
