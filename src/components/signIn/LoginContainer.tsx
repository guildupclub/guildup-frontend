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
  const [step, setStep] = useState<'login' | 'otp'>('login');
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        {step === 'login' && (
          <>
            <h1 className="font-extrabold text-3xl lg:text-4xl text-center mb-2 font-poppins">Login Now</h1>
            <p className="font-normal text-center text-base text-gray-500 font-poppins">Enter your mobile number below to login to your account</p>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400 text-xl flex items-center h-full">
                  <FiUser />
                </span>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="pl-12 font-poppins h-14 text-base border border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl bg-white"
                />
              </div>
              <div className="flex items-center relative">
                <div className="flex items-center h-14 px-4 font-poppins font-bold text-[#334BFF] text-base">
                  <select
                    className="appearance-none bg-transparent border-none outline-none font-poppins font-bold text-[#334BFF] text-base pr-4 cursor-pointer"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    required
                    style={{ minWidth: '3.5rem' }}
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <svg className="w-4 h-4 ml-[-1.2rem] text-[#334BFF] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="h-8 w-px bg-gray-200 mx-2" />
                <Input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  required
                  className="font-poppins h-14 text-base border border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl bg-white flex-1 pl-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#334BFF] text-white font-bold font-poppins py-3 rounded-xl hover:bg-blue-700 transition text-lg shadow-md"
              >
                Login
              </button>
            </form>
            <div className="text-center mt-4 text-base font-poppins">
              Don't have an account? <span className="text-[#334BFF] cursor-pointer font-semibold">Sign Up now</span>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-xs font-poppins">or Login with</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
            <GoogleSignIn />
          </>
        )}
        {step === 'otp' && (
          <>
            <h1 className="font-extrabold text-3xl text-center mb-2 font-poppins">Verify Phone number</h1>
            <p className="text-center text-gray-500 mb-6 font-poppins">OTP has been shared to {countryCode}-{phone}</p>
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 text-center border rounded-md text-xl focus:ring-2 focus:ring-blue-400 font-poppins"
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                />
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className="flex-1 border border-[#334BFF] text-[#334BFF] py-2 rounded-md hover:bg-blue-50 font-poppins"
                onClick={() => setStep('login')}
              >Back</button>
              <button
                className="flex-1 bg-[#334BFF] text-white py-2 rounded-md hover:bg-blue-700 font-poppins"
                // onClick={...} // No real OTP logic
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
        <div className="mt-8 text-center text-xs text-gray-400 font-poppins">
          © 2025 <span className="text-[#334BFF] font-bold">GuildUp</span>. All Rights Reserved.<br />
          <span className="inline-block mt-2">
            <a href="/privacy-policy" className="hover:underline">Privacy & Policy</a> |
            <a href="/terms-conditions" className="hover:underline ml-1">Terms & Condition</a>
          </span>
        </div>
      </div>
    </div>
  );
};