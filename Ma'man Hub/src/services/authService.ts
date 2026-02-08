import api from './api';

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: number; 
  dateOfBirth: Date;
  country: string;
  expertise?: string;
  portfolioUrl?: string;
  cvLink?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  phone?: string;
  country: string;
  bio?: string;
  createdAt: string;
  isFirstLogin: boolean;
  
  // Student-specific
  learningGoals?: string;
  enrolledCourses?: number;
  achievements?: number;
  totalHoursLearned?: number;
  
  // Parent-specific
  childrenCount?: number;
  parentalControlsActive?: boolean;
  notificationPreferences?: NotificationPreferences;
  paymentMethods?: PaymentMethod[];
  
  // ContentCreator-specific
  isVerifiedCreator?: boolean;
  expertise?: string[];
  totalCourses?: number;
  totalStudents?: number;
  totalRevenue?: number;
  averageRating?: number;
  socialLinks?: any;
  payoutSettings?: any;
  
  // Specialist-specific
  professionalTitle?: string;
  specializations?: string[];
  certifications?: any[];
  yearsOfExperience?: number;
  availability?: any[];
  hourlyRate?: number;
  sessionRates?: any;
  rating?: number;
  studentsHelped?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  expiresAt: string;
}

export interface Course {
  id: string;
  title: string;
  progress: number;
  instructor: string;
  thumbnail?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export enum ChildStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EMAIL_NOT_VERIFIED = "email_not_verified",
}

// Parent-specific interfaces
export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  profilePictureUrl?: string;
  courses: number;
  status: ChildStatus
}

export interface NotificationPreferences {
  progressUpdates: boolean;
  weeklyReports: boolean;
  achievementAlerts: boolean;
  paymentReminders: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string; // vodafone_cash, instapay, fawry, bank_account
  displayInfo: string; // Display text for the payment method
  isDefault: boolean;
  // Legacy card fields (for backward compatibility)
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export const authService = {
  // ============================================
  // AUTHENTICATION METHODS
  // ============================================
  
  register: async (data: RegisterData) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
      dateOfBirth: data.dateOfBirth,
      country: data.country,
      ...(data.expertise && { expertise: data.expertise }),
      ...(data.portfolioUrl && { portfolioUrl: data.portfolioUrl }),
      ...(data.cvLink && { cvLink: data.cvLink }),
    };

    const response = await api.post('/Auth/register', payload);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/Auth/login', {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
    });
    
    const authData: AuthResponse = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
      expiresAt: response.data.expiresAt,
    };
    
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    
    return authData;
  },

  logout: async () => {
    try {
      await api.post('/Auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/Auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/Auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/Auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/Auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Change user password
   * @param data - Current password and new password
   * @returns Promise<void>
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post('/Auth/change-password', data);
  },

  googleAuth: () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${api.defaults.baseURL}/Auth/google`;
  },

  // ============================================
  // USER PROFILE METHODS
  // ============================================

  /// Get current user profile
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/User/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<UserDto>): Promise<UserDto> => {
    const response = await api.put('/User/profile', data);
    return response.data;
  },

  // ============================================
  // STUDENT-SPECIFIC METHODS
  // ============================================

  // Get enrolled courses
  getEnrolledCourses: async (): Promise<Course[]> => {
    const response = await api.get('/Student/courses');
    return response.data;
  },

  // Get achievements
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/Student/achievements');
    return response.data;
  },

  // ============================================
  // PARENT-SPECIFIC METHODS
  // ============================================
  
  /**
   * Get all linked children for the current parent
   * @returns Promise<Child[]> - Array of linked children
   */
  getLinkedChildren: async (): Promise<Child[]> => {
    const response = await api.get('/Parent/children');
    return response.data;
  },

  /**
   * Add a child to parent's account
   * @param childData - Child information (name, age, optional email)
   * @returns Promise<Child> - The newly added child
   */
  addChild: async (childData: { 
    name: string; 
    age: number; 
    email?: string 
  }): Promise<Child> => {
    const response = await api.post('/Parent/children', childData);
    return response.data;
  },

  /**
   * Remove/unlink a child from parent's account
   * @param childId - The ID of the child to remove
   * @returns Promise<void>
   */
  removeChild: async (childId: string): Promise<void> => {
    await api.delete(`/Parent/children/${childId}`);
  },

  /**
   * Get notification preferences for the current parent
   * @returns Promise<NotificationPreferences>
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get('/Parent/notifications');
    return response.data;
  },

  /**
   * Update notification preferences for the current parent
   * @param preferences - Updated notification preferences
   * @returns Promise<NotificationPreferences> - The updated preferences
   */
  updateNotificationPreferences: async (
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> => {
    const response = await api.put('/Parent/notifications', preferences);
    return response.data;
  },

  /**
   * Get all payment methods for the current parent
   * @returns Promise<PaymentMethod[]> - Array of payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/Parent/payment-methods');
    return response.data;
  },

  /**
   * Add a new payment method to parent's account
   * Supports: Vodafone Cash, Instapay, Fawry, Bank Account
   * @param paymentMethodData - Payment method details based on type
   * @returns Promise<PaymentMethod> - The newly added payment method
   */
  addPaymentMethod: async (paymentMethodData: {
    type: 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_account';
    // Vodafone Cash
    phoneNumber?: string;
    // Instapay
    instapayId?: string;
    // Fawry
    referenceNumber?: string;
    // Bank Account
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  }): Promise<PaymentMethod> => {
    const response = await api.post('/Parent/payment-methods', paymentMethodData);
    return response.data;
  },

  /**
   * Set a payment method as the default
   * @param paymentMethodId - The ID of the payment method to set as default
   * @returns Promise<void>
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.put(`/Parent/payment-methods/${paymentMethodId}/default`);
  },

  /**
   * Remove a payment method from parent's account
   * @param paymentMethodId - The ID of the payment method to remove
   * @returns Promise<void>
   */
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.delete(`/Parent/payment-methods/${paymentMethodId}`);
  },

  /**
   * Search for a child account by email
   * @param email - Email address to search for
   * @returns Promise with exists flag and child data if found
   */
  searchChildByEmail: async (email: string): Promise<{ 
    exists: boolean; 
    child?: any;
  }> => {
    const response = await api.get(`/Parent/search-child`, { 
      params: { email } 
    });
    return response.data;
  },
  /**
   * Send a link invitation to an existing child account
   * @param childId - ID of the child to send invite to
   * @returns Promise<void>
   */
  sendChildLinkInvite: async (childId: string): Promise<void> => {
    await api.post(`/Parent/send-invite/${childId}`);
  },

  /**
   * Create a new child account and link it to parent
   * @param childData - New child account data
   * @returns Promise with created child information
   */
  createAndLinkChild: async (childData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    country: string;
  }): Promise<any> => {
    const response = await api.post('/Parent/create-child', childData);
    return response.data;
  },


  /**
   * Get child's course progress
   * @param childId - ID of the child
   * @returns Promise with course progress data
   */
  getChildProgress: async (childId: string): Promise<any> => {
    const response = await api.get(`/Parent/children/${childId}/progress`);
    return response.data;
  },
};