// services/appointmentService.ts
import api from './api';

export interface BookSessionDto {
  specialistId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
}

export const appointmentService = {
  bookSession: async (data: BookSessionDto): Promise<void> => {
    await api.post('/Appointment', data);
  },

  getMyAppointments: async (): Promise<AppointmentDto[]> => {
    const response = await api.get('/Appointment/my');
    return response.data;
  },

  getBookedSlots: async (specialistId: string, date: string): Promise<string[]> => {
    const response = await api.get('/Appointment/booked-slots', {
      params: { specialistId, date },
    });
    return response.data;
  },

  confirmAppointment: async (id: string): Promise<void> => {
    await api.put(`/Appointment/${id}/confirm`);
  },

  cancelAppointment: async (id: string, reason?: string): Promise<void> => {
    await api.put(`/Appointment/${id}/cancel`, { reason });
  },

  completeAppointment: async (id: string): Promise<void> => {
    await api.put(`/Appointment/${id}/complete`);
  },
};