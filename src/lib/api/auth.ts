import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const requestOtp = (data: { phone: string; name?: string }) =>
  axios.post(`${BASE_URL}/v1/auth/request-otp`, data);

export const verifyOtp = (data: { phone: string; otp: string; name?: string }) =>
  axios.post(`${BASE_URL}/v1/auth/verify-otp`, data); 