'use server';

import { getBookings, BookingWithDetails } from '../bookings/queries';

export async function getGuestBookingsAction(guestId: string): Promise<BookingWithDetails[]> {
  try {
    return await getBookings({ guestId });
  } catch (err) {
    console.error(`Error in getGuestBookingsAction for guest ${guestId}:`, err);
    return [];
  }
}
