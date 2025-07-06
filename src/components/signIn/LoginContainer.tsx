"use client"
import React, { useState } from "react";
import GoogleSignIn from "../common/GoogleSignIn";
import { Input } from "../ui/input";
import { FiUser, FiPhone } from "react-icons/fi";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRequestOtp, useVerifyOtp } from "@/hooks/queries/useAuth";
import guilduplogo from "../../../public/guilduplogo.webp";
import Image from "next/image";

const countryCodes = [
  { code: "+91", label: "India" },
  { code: "+1", label: "USA" },
  { code: "+44", label: "UK" },
];

export const LoginContainer: React.FC = () => {
  const [step, setStep] = useState<'login' | 'otp' | 'signup'>('login');
  const [prevStep, setPrevStep] = useState<'login' | 'signup'>('login');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [resendActive, setResendActive] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpName, setOtpName] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const {
    mutate: requestOtp,
    status: requestOtpStatus,
  } = useRequestOtp();
  const {
    mutate: verifyOtp,
    status: verifyOtpStatus,
  } = useVerifyOtp();
  const isRequestingOtp = requestOtpStatus === "pending";
  const isVerifyingOtp = verifyOtpStatus === "pending";
  const loading = isRequestingOtp || isVerifyingOtp;

  React.useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendActive(true);
    }
  }, [step, timer]);

  React.useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

 
  const saveSignupData = (name: string, phone: string) => {
    localStorage.setItem('signup_name', name);
    localStorage.setItem('signup_phone', phone);
  };
  const saveLoginData = (phone: string) => {
    localStorage.setItem('login_phone', phone);
  };
  const removeSignupData = () => {
    localStorage.removeItem('signup_name');
    localStorage.removeItem('signup_phone');
  };
  const removeLoginData = () => {
    localStorage.removeItem('login_phone');
  };
  const getSignupData = () => ({
    name: localStorage.getItem('signup_name') || '',
    phone: localStorage.getItem('signup_phone') || '',
  });
  const getLoginData = () => ({
    phone: localStorage.getItem('login_phone') || '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPrevStep('login');
    setError("");
    const phoneVal = countryCode.replace("+", "") + phone;
    saveLoginData(phoneVal);
    requestOtp(
      { phone: phoneVal },
      {
        onSuccess: (res: any) => {
          if (res.data.r === "e") {
            setError(res.data.e || "Failed to send OTP");
            toast.error(res.data.e || "Failed to send OTP");
            if (res.data.e === "Please wait a few minutes before requesting another OTP.") {
              setCooldown(120);
            }
          } else {
            setOtpPhone(phoneVal);
            setOtpName("");
            setStep('otp');
            setTimer(59);
            setResendActive(false);
            toast.success(res.data.data?.message || "OTP sent successfully");
          }
        },
        onError: (error: any) => {
          const apiError = error?.response?.data?.e;
          setError(apiError || "Network error");
          toast.error(apiError || "Network error");
        },
      }
    );
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setPrevStep('signup');
    setError("");
    const phoneVal = countryCode.replace("+", "") + phone;
    saveSignupData(fullName, phoneVal);
    requestOtp(
      { phone: phoneVal, name: fullName },
      {
        onSuccess: (res: any) => {
          if (res.data.r === "e") {
            setError(res.data.e || "Failed to send OTP");
            toast.error(res.data.e || "Failed to send OTP");
            if (res.data.e === "Please wait a few minutes before requesting another OTP.") {
              setCooldown(120);
            }
          } else {
            setOtpPhone(phoneVal);
            setOtpName(fullName);
            setStep('otp');
            setTimer(59);
            setResendActive(false);
            toast.success(res.data.data?.message || "OTP sent successfully");
          }
        },
        onError: (error: any) => {
          const apiError = error?.response?.data?.e;
          setError(apiError || "Network error");
          toast.error(apiError || "Network error");
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    let payload: any = {
      phone: otpPhone,
      otp: otpValue,
    };
    if (prevStep === 'signup') payload.name = otpName;
    verifyOtp(payload, {
      onSuccess: (res: any) => {
        if (res.data.r === "e") {
          setError(res.data.e || "OTP verification failed");
          toast.error(res.data.e || "OTP verification failed");
        } else {
          const user = res.data.data.user;
          const token = res.data.data.token;
          dispatch(setUser({
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
            image: user.avatar,
            accessToken: token,
            phone: user.phone,
          }));
          toast.success(res.data.data.message || "Signed in successfully!");
          removeSignupData();
          removeLoginData();
          router.push("/");
          router.refresh();
        }
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.e;
        setError(apiError || "Network error");
        toast.error(apiError || "Network error");
      },
    });
  };

  const handleResendOtp = () => {
    setError("");
    let payload: any = {};
    if (prevStep === 'signup') {
      const { name, phone } = getSignupData();
      payload = { phone, name };
    } else {
      const { phone } = getLoginData();
      payload = { phone };
    }
    requestOtp(payload, {
      onSuccess: (res: any) => {
        if (res.data.r === "e") {
          setError(res.data.e || "Failed to resend OTP");
          toast.error(res.data.e || "Failed to resend OTP");
          if (res.data.e === "Please wait a few minutes before requesting another OTP.") {
            setCooldown(120);
          }
        } else {
          setTimer(59);
          setResendActive(false);
          toast.success(res.data.data?.message || "OTP resent successfully");
        }
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.e;
        setError(apiError || "Network error");
        toast.error(apiError || "Network error");
      },
    });
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
  
    if (value && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  return (
    <div className="max-h-screen min-h-screen lg:h-full relative flex flex-col items-center justify-center bg-white  px-2 py-6 sm:px-4 sm:py-8">
       
      <div className="w-full max-w-xl space-y-3 lg:space-y-4  p-4 sm:p-8 justify-center items-center">
        {step === 'login' && (
          <>
         <div className=" z-10 flex lg:hidden gap-3 md:gap-4 lg:gap-5 items-center justify-start mb-20 mt-6">
         
                     <Image
                       src={guilduplogo}
                       alt="GuildUp Logo"
                       className="w-10 md:w-14 lg:w-20 h-8 md:h-12 lg:h-16 "
                     />
                     <h1 className={`font-semibold text-2xl md:text-3xl lg:text-4xl font-poppins`}>GuildUp</h1>
                   </div>
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Login Now</h1>
            <p className="font-normal text-center text-sm lg:text-base text-gray-500 font-poppins">Enter your mobile number below to login to your account</p>
            {error && <div className="text-red-500 text-center font-bold mb-2">{error}</div>}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative group flex items-center border border-gray-200 rounded-xl bg-white px-2 lg:px-3 py-1 lg:py-1 focus-within:ring-2 focus-within:ring-blue-400">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  required
                  className="appearance-none bg-transparent border-none outline-none font-poppins font-bold text-gray-700 text-base pr-2 cursor-pointer focus:ring-0 focus:outline-none"
                  style={{ minWidth: '3.5rem' }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                {/* Dropdown arrow */}
                <span className="pointer-events-none absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  required
                  className="flex-1 font-poppins  h-8 sm:h-10 text-base font-medium text-gray-800  border-none outline-none bg-transparent pl-2 focus:ring-0 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#334BFF] text-white font-bold font-poppins py-2 lg:py-3 rounded-xl hover:bg-blue-700 transition text-lg shadow-md"
                disabled={loading || cooldown > 0}
              >
                {isRequestingOtp ? "Sending OTP..." : cooldown > 0 ? `Wait ${cooldown}s` : "Login"}
              </button>
            </form>
            <div className="text-center mt-3 lg:mt-4 text-sm lg:text-base font-poppins">
              Don't have an account? <span className="text-[#334BFF] cursor-pointer font-semibold" onClick={() => { setStep('signup'); setFullName(''); }}>Sign Up now</span>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-xs font-poppins">or Login with</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
            <GoogleSignIn />
          </>
        )}
        {step === 'signup' && (
          <>
            <div className=" z-10 flex lg:hidden gap-3 md:gap-4 lg:gap-5 items-center justify-start mb-16 mt-8">
         
                     <Image
                       src={guilduplogo}
                       alt="GuildUp Logo"
                       className="w-10 md:w-14 lg:w-20 h-8 md:h-12 lg:h-16 "
                     />
                     <h1 className={`font-semibold text-2xl md:text-3xl lg:text-4xl font-poppins`}>GuildUp</h1>
                   </div>
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Sign Up Now</h1>
            <p className="font-normal text-center text-sm lg:text-base text-gray-500 font-poppins">Enter your mobile number below to create your account</p>
            {error && <div className="text-red-500 text-center font-bold mb-2">{error}</div>}
            <form className="space-y-3 lg:space-y-4" onSubmit={handleSignup}>
              <div className="relative group flex items-center border border-gray-200 rounded-xl bg-white px-3 py-1 lg:py-1 focus-within:ring-2 focus-within:ring-blue-400">
                <span className="absolute left-4 text-gray-400 text-xl flex items-center h-full">
                  <FiUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="pl-10 font-poppins h-8 sm:h-10 text-base font-medium text-gray-800 border-none outline-none bg-transparent flex-1 focus:ring-0 focus:outline-none"
                  style={{ minWidth: '0' }}
                />
              </div>
              <div className="relative group flex items-center border border-gray-200 rounded-xl bg-white px-3  py-1 lg:py-1 focus-within:ring-2 focus-within:ring-blue-400">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  required
                  className="appearance-none bg-transparent border-none outline-none font-poppins font-bold text-gray-700 text-base pr-2 cursor-pointer focus:ring-0 focus:outline-none"
                  style={{ minWidth: '3.5rem' }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                {/* Dropdown arrow */}
                <span className="pointer-events-none absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  required
                  className="flex-1 font-poppins  h-8 sm:h-10 text-base font-medium text-gray-800 border-none outline-none bg-transparent pl-2 focus:ring-0 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#334BFF] text-white font-bold font-poppins py-2  rounded-xl hover:bg-blue-700 transition text-base lg:text-lg shadow-md"
                disabled={loading || cooldown > 0}
              >
                {isRequestingOtp ? "Sending OTP..." : cooldown > 0 ? `Wait ${cooldown}s` : "Sign Up"}
              </button>
            </form>
            <div className="text-center mt-2 lg:mt-4 text-base font-poppins">
              Already have an account? <span className="text-[#334BFF] cursor-pointer font-semibold" onClick={() => { setStep('login'); setFullName(''); }}>Login now</span>
            </div>
            <div className="flex items-center my-2 lg:my-4">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-xs font-poppins">or sign up with</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
            <GoogleSignIn />
          </>
        )}
        {step === 'otp' && (
          <>
           <div className=" z-10 flex lg:hidden gap-3 md:gap-4 lg:gap-5 items-center justify-start mb-16 mt-8">
         
                     <Image
                       src={guilduplogo}
                       alt="GuildUp Logo"
                       className="w-10 md:w-14 lg:w-20 h-8 md:h-12 lg:h-16 "
                     />
                     <h1 className={`font-semibold text-2xl md:text-3xl lg:text-4xl font-poppins`}>GuildUp</h1>
                   </div>
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Verify Phone number</h1>
            <p className="text-center text-gray-500 mb-3 lg:mb-6 font-poppins">OTP has been shared to {countryCode}-{phone}</p>
            {error && <div className="text-red-500 text-center font-bold mb-2">{error}</div>}
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 sm:w-12 h-10 sm:h-12 text-center border border-gray-200 rounded-xl text-xl font-poppins text-gray-900 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400 outline-none transition"
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                />
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className="flex-1 border border-[#334BFF] text-[#334BFF] py-1 lg:py-2 rounded-md hover:bg-blue-50 font-poppins"
                onClick={() => { setStep(prevStep); setOtp(["", "", "", "", "", ""]); setError(""); }}
                disabled={loading}
              >Back</button>
              <button
                className="flex-1 bg-[#334BFF] text-white py-1 lg:py-2 rounded-md hover:bg-blue-700 font-poppins"
                onClick={handleVerifyOtp}
                disabled={loading}
              >{isVerifyingOtp ? "Verifying..." : "Verify"}</button>
            </div>
            <div className="flex justify-between text-xs font-poppins">
              <span>OTP expired in <span className="text-red-600 font-semibold">00:{timer.toString().padStart(2, '0')}</span></span>
              <span className={resendActive && cooldown === 0 ? "text-[#334BFF] cursor-pointer" : "text-gray-400"} onClick={() => resendActive && cooldown === 0 && handleResendOtp()}>
                {isRequestingOtp ? "Resending..." : cooldown > 0 ? `Wait ${cooldown}s` : "Resend Code"}
              </span>
            </div>
          </>
        )}
      
      </div>
        <div className="text-center  text-sm text-gray-400 font-poppins   lg:my-0 absolute -bottom-8 lg:bottom-2 xl:bottom-7 w-full">
    © 2025 <span className="text-[#334BFF] font-bold">GuildUp</span>. All Rights Reserved.<br />
    <span className="inline-block mt-2">
      <a href="/privacy-policy" className="hover:underline">Privacy & Policy</a> |
      <a href="/terms-conditions" className="hover:underline ml-1">Terms & Condition</a>
    </span>
  </div>
    </div>
  );
};