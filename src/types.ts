export type SoilType = 'Kumlu' | 'Tınlı' | 'Killi';

export interface Crop {
  id: string;
  fieldId?: string;
  name: string;
  category?: string;
  area: number; // in m²
  sowingDate: string; // YYYY-MM-DD
  currentStage: string;
}

export interface Field {
  id: string;
  name: string;
  city: string;
  district: string;
  soilType: SoilType;
  totalArea: number; // in m²
  crops?: Crop[];
  createdAt?: string;
  lat?: number;
  lon?: number;
  userId?: string; // Isolate fields by user to prevent sharing database data across users
}

export interface User {
  id: string;
  name: string;
  email: string;
  notificationPermission: boolean;
  cooperatives: { [coopId: string]: boolean };
  role?: 'Yönetici' | 'Uzman Danışman' | 'Premium Çiftçi' | 'Standart Çiftçi' | string;
  darkMode?: boolean;
  // Detailed Profile Fields
  age?: number;
  phone?: string;
  experienceYears?: number;
  avatar?: string;
  city?: string;
  district?: string;
  certNo?: string;
  landSize?: number;
  mainCrop?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Kurucu' | '1. Yardımcı' | '2. Yardımcı' | '3. Yardımcı' | 'Üye';
  joinedAt: string;
}

export interface Message {
  id: string;
  userId: string;
  sender: string;
  text: string;
  time: string;
  role: string;
  isPinned?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface Cooperative {
  id: string;
  name: string;
  productGroup: string;
  region: string;
  description: string;
  members: { [userId: string]: Member };
  messages: Message[];
  announcements: Announcement[];
}

export interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  pastRain: number[]; // exactly 5 days
  forecastTemp: { time: string; value: number }[];
  forecastRain: { time: string; value: number }[];
}
