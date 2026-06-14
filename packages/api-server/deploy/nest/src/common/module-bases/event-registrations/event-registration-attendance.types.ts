import type { EventRegistrationRowDto } from './event-registrations.service';

export type AttendanceSource = 'hanet' | 'manual';

export type ManualAttendanceAction =
  | 'checkin'
  | 'checkout'
  | 'reset-checkin'
  | 'reset-checkout'
  | 'reset-all';

export type ApplyAttendanceResult = {
  kind: 'checkin' | 'checkout';
  eventId: number;
  email: string;
  fullName: string;
  registrationId: number;
  at: string;
  duplicate?: boolean;
  registration: EventRegistrationRowDto;
};

export type EventAttendanceSocketPayload = {
  kind: 'checkin' | 'checkout';
  eventId: number;
  at: string;
  email: string;
  fullName: string;
  source: AttendanceSource;
  deviceId?: string | null;
  deviceName?: string | null;
  registrationId?: string | number | null;
  checkinId?: string | null;
  duplicate?: boolean;
  hasCheckin?: boolean;
  hasCheckout?: boolean;
};

/** Khớp `RegistrationStatus` entity. */
export const REGISTRATION_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
} as const;

/** Khớp `AttendanceStatus` entity. */
export const ATTENDANCE_STATUS = {
  NOT_ATTENDED: 0,
  PARTIAL: 1,
  FULL: 2,
} as const;

/** Khớp `CheckinMethod` entity. */
export const CHECKIN_METHOD = {
  NONE: 0,
  QR_CODE: 1,
  FACE_ID: 2,
  MANUAL: 3,
} as const;

export type EventAttendancePolicy = {
  allowCheckin: boolean;
  allowCheckout: boolean;
  checkinStart?: Date | null;
  checkinEnd?: Date | null;
  checkoutStart?: Date | null;
  checkoutEnd?: Date | null;
  endDate?: Date | null;
};

export type AttendanceRegistrationRow = {
  id: number;
  email: string;
  fullName: string;
  event: unknown;
  hasCheckin: boolean;
  hasCheckout: boolean;
  faceVerified: boolean;
  checkinMethod: number;
  attendanceStatus: number;
  status: number;
  updatedAt: Date;
};

