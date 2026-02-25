import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase' // 타입 추출 후 연결

export function createClient() {
  // 클라이언트 컴포넌트에서 싱글톤처럼 사용할 수 있도록 구성됩니다.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}   