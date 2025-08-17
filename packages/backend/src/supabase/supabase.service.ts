import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!url || !anonKey) {
      throw new Error('Supabase URL and anon key are required');
    }

    this.supabase = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }

  // Database methods
  async getTerminals() {
    return this.supabase
      .from('terminals')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getVessels() {
    return this.supabase
      .from('vessels')
      .select('*')
      .order('eta', { ascending: true });
  }

  async getContainers() {
    return this.supabase
      .from('containers')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getSlots() {
    return this.supabase
      .from('slots')
      .select('*')
      .order('window_start', { ascending: true });
  }

  async getDrivers() {
    return this.supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getTrips() {
    return this.supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
  }

  // Real-time subscriptions
  subscribeToTerminals(callback: (payload: any) => void) {
    return this.supabase
      .channel('terminals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'terminals' }, callback)
      .subscribe();
  }

  subscribeToVessels(callback: (payload: any) => void) {
    return this.supabase
      .channel('vessels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vessels' }, callback)
      .subscribe();
  }

  subscribeToContainers(callback: (payload: any) => void) {
    return this.supabase
      .channel('containers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'containers' }, callback)
      .subscribe();
  }

  subscribeToSlots(callback: (payload: any) => void) {
    return this.supabase
      .channel('slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, callback)
      .subscribe();
  }

  subscribeToTrips(callback: (payload: any) => void) {
    return this.supabase
      .channel('trips')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, callback)
      .subscribe();
  }
}
