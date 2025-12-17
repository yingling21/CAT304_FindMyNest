import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrkppjilukxbvywiopmz.supabase.co';
const supabasePublishableKey = 'sb_publishable_XobcTMD_zHX9HrZFujBZ0w_1V6ljAK6';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})