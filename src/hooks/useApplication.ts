import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'
import { applyToRun } from '@/app/(main)/runs/[id]/actions'

export function applicationQueryKey(runId: string) {
  return ['application', runId] as const
}

async function fetchMyApplication(
  runId: string
): Promise<Tables<'Applications'> | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('Applications')
    .select('*')
    .eq('run_id', runId)
    .eq('user_id', user.id)
    .maybeSingle()

  return data ?? null
}

export function useApplication(runId: string) {
  return useQuery({
    queryKey: applicationQueryKey(runId),
    queryFn: () => fetchMyApplication(runId),
  })
}

export function useApplyToRun(runId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => applyToRun(runId),
    onSuccess: (result) => {
      if ('success' in result) {
        queryClient.invalidateQueries({ queryKey: applicationQueryKey(runId) })
        queryClient.invalidateQueries({ queryKey: ['my-runs'] })
      }
    },
  })
}
