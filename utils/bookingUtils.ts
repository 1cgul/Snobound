import { Listing, RecurringListing } from '../types';
import ListingService from '../services/listingService';

export const formatTime = (time: string): string => {
  if (!time || typeof time !== 'string') return 'N/A';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const generateRecurringDates = async (recurring: RecurringListing[]): Promise<Listing[]> => {
  const generated: Listing[] = [];
  const today = new Date();
  
  for (const recur of recurring) {
    const exclusions = await ListingService.getExclusions(recur.id!);
    let current = new Date(Math.max(recur.startDate.getTime(), today.getTime()));
    const end = recur.endDate;
    
    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      if (current.getDay() === recur.dayOfWeek && !exclusions.includes(dateString)) {
        generated.push({
          id: `${recur.id}-${dateString}`,
          teacherId: recur.teacherId,
          date: dateString,
          startTime: recur.startTime,
          endTime: recur.endTime,
          location: recur.location,
          price: recur.price,
          skill: recur.skill,
          createdAt: recur.createdAt,
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }
  
  return generated;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); // Adjust for timezone
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};