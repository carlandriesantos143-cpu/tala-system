import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseKey = publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'tala-bhw-session',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
    global: {
    headers: {
      'x-client-info': 'tala-pwa'
    }
  }
})

