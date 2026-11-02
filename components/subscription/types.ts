export interface CheckoutFormData {
  hotelName: string;
  ownerName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  agreeTerms: boolean;
  includeOnboarding: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFormData, string>>;

export type CheckoutUIState =
  | 'checkout'
  | 'processing'
  | 'success'
  | 'failed'
  | 'pending';

export interface PrepopulatedProfile {
  hotelName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  isAuthenticated?: boolean;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  currency: string;
  currencySymbol: string;
  billingFrequency: string;
  gstRate: number; // 0.18 = 18%
  onboardingFee: number; // 10000
  commission: string;
}

export const GROVE_SUBSCRIPTION_PLAN: SubscriptionPlanDetails = {
  id: 'grove-os',
  name: 'Grove Operating System',
  tagline: 'Unified Property Management for Independent & Boutique Hotels',
  monthlyPrice: 999,
  currency: 'INR',
  currencySymbol: '₹',
  billingFrequency: 'Monthly recurring',
  gstRate: 0.18,
  onboardingFee: 10000,
  commission: '0% per-booking commission',
};

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

