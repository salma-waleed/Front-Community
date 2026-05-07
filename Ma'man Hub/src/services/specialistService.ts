import api from './api';

export interface SpecialistCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  fileUrl?: string;
  fileName?: string;
}

export interface SpecialistAvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface SpecialistSessionRates {
  thirtyMin: number;
  sixtyMin: number;
  ninetyMin: number;
}

export interface SpecialistProfileUpdateDto {
  professionalTitle?: string;
  bio?: string;
  specializations?: string[];
  yearsOfExperience?: number;
  country?: string;
  phone?: string;
  fullName?: string;
}

export interface AddCertificationDto {
  name: string;
  issuer: string;
  year: string;
  file?: File;
}

export interface AddAvailabilitySlotDto {
  day: string;
  startTime: string;
  endTime: string;
}

export interface UpdateSessionRatesDto {
  hourlyRate: number;
}

export interface SpecialistNotificationPreferences {
  newSessionBooking: boolean;
  sessionCancellation: boolean;
  sessionReminder: boolean;
  newMessage: boolean;
  sessionReview: boolean;
  payoutProcessed: boolean;
  payoutFailed: boolean;
  weeklyEarningsSummary: boolean;
}

export interface SpecialistListItemDto {
  id: string;
  fullName: string;
  profilePictureUrl?: string;
  bio?: string;
  country?: string;
  professionalTitle?: string;
  specializations: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  rating: number;
  studentsHelped: number;
  reviewsCount: number;
}

export interface PagedSpecialistsResult {
  items: SpecialistListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetSpecialistsParams {
  search?: string;
  specialization?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  sortBy?: 'rating' | 'rate' | 'experience';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const specialistService = {

  // Availability
  getAvailability: async (): Promise<SpecialistAvailabilitySlot[]> => {
    const response = await api.get('/Specialist/availability');
    return response.data;
  },

  addAvailabilitySlot: async (data: AddAvailabilitySlotDto): Promise<SpecialistAvailabilitySlot> => {
    const response = await api.post('/Specialist/availability', data);
    return response.data;
  },

  updateAvailabilitySlot: async (
    slotId: string,
    data: AddAvailabilitySlotDto
  ): Promise<SpecialistAvailabilitySlot> => {
    const response = await api.put(`/Specialist/availability/${slotId}`, data);
    return response.data;
  },

  deleteAvailabilitySlot: async (slotId: string): Promise<void> => {
    await api.delete(`/Specialist/availability/${slotId}`);
  },

  // Rates
  updateSessionRates: async (data: UpdateSessionRatesDto): Promise<void> => {
    await api.put('/Specialist/rates', data);
  },

  getSpecialists: async (params: GetSpecialistsParams = {}): Promise<PagedSpecialistsResult> => {
  const response = await api.get('/Specialist', { params });
  return response.data;
},

};