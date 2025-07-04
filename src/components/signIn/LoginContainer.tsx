import React, { useState } from "react";
import GoogleSignIn from "../common/GoogleSignIn";
import { Input } from "../ui/input";
import { FiUser, FiPhone } from "react-icons/fi";

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

  React.useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendActive(true);
    }
  }, [step, timer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPrevStep('login');
    setStep('otp');
    setTimer(59);
    setResendActive(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setPrevStep('signup');
    setStep('otp');
    setTimer(59);
    setResendActive(false);
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
    <div className="h-full relative flex flex-col items-center justify-center bg-white  px-2 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-xl space-y-3 lg:space-y-4  p-4 sm:p-8">
        {step === 'login' && (
          <>
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Login Now</h1>
            <p className="font-normal text-center text-sm lg:text-base text-gray-500 font-poppins">Enter your mobile number below to login to your account</p>
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
                  className="flex-1 font-poppins h-8 sm:h-10 text-base font-medium text-[#898989] border-none outline-none bg-transparent pl-2 focus:ring-0 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#334BFF] text-white font-bold font-poppins py-2 lg:py-3 rounded-xl hover:bg-blue-700 transition text-lg shadow-md"
              >
                Login
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
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Sign Up Now</h1>
            <p className="font-normal text-center text-sm lg:text-base text-gray-500 font-poppins">Enter your mobile number below to create your account</p>
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
                  className="pl-10 font-poppins h-8 sm:h-10 text-base font-medium text-[#898989] border-none outline-none bg-transparent flex-1 focus:ring-0 focus:outline-none"
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
                  className="flex-1 font-poppins  h-8 sm:h-10 text-base font-medium text-[#898989] border-none outline-none bg-transparent pl-2 focus:ring-0 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#334BFF] text-white font-bold font-poppins py-2  rounded-xl hover:bg-blue-700 transition text-base lg:text-lg shadow-md"
              >
                Sign Up
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
            <h1 className="font-extrabold text-xl sm:text-2xl lg:text-4xl text-center mb-2 font-poppins">Verify Phone number</h1>
            <p className="text-center text-gray-500 mb-3 lg:mb-6 font-poppins">OTP has been shared to {countryCode}-{phone}</p>
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
                onClick={() => { setStep(prevStep); setOtp(["", "", "", "", "", ""]); }}
              >Back</button>
              <button
                className="flex-1 bg-[#334BFF] text-white py-1 lg:py-2 rounded-md hover:bg-blue-700 font-poppins"
               
              >Verify</button>
            </div>
            <div className="flex justify-between text-xs font-poppins">
              <span>OTP expired in <span className="text-red-600 font-semibold">00:{timer.toString().padStart(2, '0')}</span></span>
              <span className={resendActive ? "text-[#334BFF] cursor-pointer" : "text-gray-400"} onClick={() => resendActive && setTimer(59)}>
                Resend Code
              </span>
            </div>
          </>
        )}
      
      </div>
        <div className="text-center text-sm text-gray-400 font-poppins my-10 lg:my-0 lg:absolute lg:bottom-2 xl:bottom-7 w-full">
    © 2025 <span className="text-[#334BFF] font-bold">GuildUp</span>. All Rights Reserved.<br />
    <span className="inline-block mt-2">
      <a href="/privacy-policy" className="hover:underline">Privacy & Policy</a> |
      <a href="/terms-conditions" className="hover:underline ml-1">Terms & Condition</a>
    </span>
  </div>
    </div>
  );
};