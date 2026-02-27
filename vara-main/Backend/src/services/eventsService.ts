import { supabaseAdmin } from '../config/supabase';

// ============ Event Interface ============

export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  registration_link?: string;
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
  max_participants?: number;
  category?: string;
  banner_image?: string;
  type?: 'upcoming' | 'past';
  created_by?: string;
}

// ============ Event Operations (Admin Only) ============

// Admin: Create event
export const createEvent = async (event: Event, adminId?: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([{
        title: event.title,
        description: event.description || null,
        date: event.date,
        time: event.time,
        location: event.location,
        registration_link: event.registration_link || null,
        status: event.status || 'draft',
        category: event.category || null,
        max_participants: event.max_participants || null,
        banner_image: event.banner_image || null,
        type: event.type || 'upcoming',
        created_by: adminId || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    return data;
  } catch (err: any) {
    console.error('Exception creating event:', err);
    throw err;
  }
};

// Admin: Update event
export const updateEvent = async (id: string, updates: Partial<Event>) => {
  const { data, error } = await supabaseAdmin
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Admin: Delete event
export const deleteEvent = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Admin: Get all events (drafts and published)
export const getEventsByAdmin = async () => {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
};

// ============ Event Operations (Public/User Read-Only) ============

// User: Get published events only (excluding expired)
export const getPublishedEvents = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error, status } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('date', today) // Only show events on or after today
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Supabase error fetching events:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  } catch (err: any) {
    console.error('❌ Exception in getPublishedEvents:', err);
    throw err;
  }
};

// User: Get single published event by ID
export const getPublishedEventById = async (id: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .gte('date', today)
      .single();

    if (error) {
      console.error('❌ Supabase error fetching event:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data;
  } catch (err: any) {
    console.error('❌ Exception in getPublishedEventById:', err);
    throw err;
  }
};

// Admin: Delete expired events
export const cleanupExpiredEvents = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error: selectError } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('status', 'published')
      .lt('date', today);

    if (selectError) throw selectError;

    if (data && data.length > 0) {
      const ids = data.map(e => e.id);
      const { error: deleteError } = await supabaseAdmin
        .from('events')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
      return { cleaned: data.length };
    }

    return { cleaned: 0 };
  } catch (err: any) {
    console.error('❌ Error during event cleanup:', err);
    throw err;
  }
};
