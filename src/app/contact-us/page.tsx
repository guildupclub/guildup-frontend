'use client';

import { FaPhone, FaEnvelope } from 'react-icons/fa';
export default function ContactUs() {
    const handlePhoneClick = () => {
        window.location.href = 'tel:9220521385';
    };

    const handleEmailClick = () => {
        window.location.href = 'mailto:support@guildup.club';
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
            <div className="flex flex-col gap-4 sm:flex-row">
                <button
                    onClick={handlePhoneClick}
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <FaPhone />
                    <span>Call Us</span>
                </button>
                <button
                    onClick={handleEmailClick}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                    <FaEnvelope />
                    <span>Email Us</span>
                </button>
            </div>
        </div>
    );
}