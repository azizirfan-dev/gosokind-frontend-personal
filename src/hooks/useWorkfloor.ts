import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStationOrders, processOrder, requestBypass, getWorkerHistory } from '@/services/worker.service';
import { StationType, ProcessPayload, BypassPayload } from '@/types/worker';

export const workfloorKeys = {
  all: ['workfloor'] as const,
  orders: (station: StationType | null) => [...workfloorKeys.all, 'orders', station] as const,
  history: () => [...workfloorKeys.all, 'history'] as const,
};

export function useStationOrders(station: StationType | null) {
  return useQuery({
    queryKey: workfloorKeys.orders(station),
    queryFn: () => getStationOrders(station!),
    enabled: !!station,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 10, // Poll every 10 seconds
  });
}

export function useWorkerHistory(enabled: boolean = true) {
  return useQuery({
    queryKey: workfloorKeys.history(),
    queryFn: getWorkerHistory,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProcessPayload) => processOrder(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workfloorKeys.orders(variables.station) });
    },
  });
}

export function useSubmitBypass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BypassPayload) => requestBypass(payload),
    onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: workfloorKeys.orders(variables.station) });
    },
  });
}
