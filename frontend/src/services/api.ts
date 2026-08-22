import { Destination, MasterActivity, Trip, User, AdminAnalyticsData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('globetrotter_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network connection error. Please ensure backend server is running.', 0);
  }
}

export const api = {
  // Auth
  auth: {
    register: (body: any) => request<{ success: boolean; requiresVerification?: boolean; email?: string; token?: string; user?: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    verifyEmailOtp: (body: { email: string; otpCode: string }) => request<{ success: boolean; token: string; user: User; message: string }>('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    login: (body: any) => request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    forgotPassword: (email: string) => request<{ success: boolean; message: string; otpPreview?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    resetPassword: (body: any) => request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getProfile: () => request<{ success: boolean; user: User }>('/auth/profile'),
    updateProfile: (body: any) => request<{ success: boolean; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    deleteAccount: () => request<{ success: boolean; message: string }>('/auth/account', {
      method: 'DELETE'
    })
  },

  // Trips
  trips: {
    getMyTrips: () => request<{ success: boolean; trips: Trip[] }>('/trips'),
    getTripById: (id: string) => request<{ success: boolean; trip: Trip }>(`/trips/${id}`),
    createTrip: (body: any) => request<{ success: boolean; tripId: string; shareSlug: string; message: string }>('/trips', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    updateTrip: (id: string, body: any) => request<{ success: boolean; message: string }>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    deleteTrip: (id: string) => request<{ success: boolean; message: string }>(`/trips/${id}`, {
      method: 'DELETE'
    }),
    duplicateTrip: (id: string) => request<{ success: boolean; tripId: string; message: string }>(`/trips/${id}/duplicate`, {
      method: 'POST'
    }),
    getPublicTrip: (slug: string) => request<{ success: boolean; trip: Trip }>(`/trips/share/${slug}`),

    // Stops
    addStop: (tripId: string, body: any) => request<{ success: boolean; stopId: string; message: string }>(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    updateStop: (stopId: string, body: any) => request<{ success: boolean; message: string }>(`/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    deleteStop: (stopId: string) => request<{ success: boolean; message: string }>(`/stops/${stopId}`, {
      method: 'DELETE'
    }),
    reorderStops: (stopIds: string[]) => request<{ success: boolean; message: string }>('/stops/reorder', {
      method: 'POST',
      body: JSON.stringify({ stopIds })
    }),

    // Activities
    addActivity: (stopId: string, body: any) => request<{ success: boolean; actId: string; message: string }>(`/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    deleteActivity: (actId: string) => request<{ success: boolean; message: string }>(`/activities/${actId}`, {
      method: 'DELETE'
    })
  },

  // Destinations & Master Activities
  destinations: {
    getAll: (params?: { search?: string; continent?: string; cost_index?: string; limit?: string | number }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; destinations: Destination[] }>(`/destinations${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; destination: Destination }>(`/destinations/${id}`),
    getAllActivities: (params?: { search?: string; category?: string; maxCost?: number; destinationId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; activities: MasterActivity[] }>(`/activities/catalog${query ? `?${query}` : ''}`);
    },
    getWishlist: () => request<{ success: boolean; wishlist: Destination[] }>('/wishlist'),
    toggleWishlist: (destinationId: string) => request<{ success: boolean; saved: boolean; message: string }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ destinationId })
    })
  },

  // Admin
  admin: {
    getAnalytics: () => request<{ success: boolean; analytics: AdminAnalyticsData }>('/admin/analytics'),
    getUsers: () => request<{ success: boolean; users: User[] }>('/admin/users'),
    updateUserStatus: (id: string, body: any) => request<{ success: boolean; message: string }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    deleteUser: (id: string) => request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    })
  }
};
