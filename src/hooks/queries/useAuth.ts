import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";

export function useRequestOtp() {
  return useMutation({ mutationFn: authApi.requestOtp });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: authApi.verifyOtp });
} 