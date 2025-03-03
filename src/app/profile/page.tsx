"use client";

import * as React from "react";
import Image from "next/image";
import { FaArrowLeft } from 'react-icons/fa';
import InputField from '@/components/userProfile/Input'



const ProfilePage = () => {
  const [profile, setProfile] = React.useState({
    firstName: "Ravi Kumar Cyber Specialist",
    lastName: "Cyber Specialist",
    email: "ravikumarcyber@gmail.com",
    phone: "9205087xxx",
    location: "Sector 42, near Rajiv chowk",
    password: "Ravi@1234",
  });

  const [isEditable, setIsEditable] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Profile Data:", profile);
    setIsEditable(false);
  };

  return (
    <div className="flex bg-[#f2f2f2]">
      <div className="flex grow flex-col w-full gap-6 px-20 mx-5 mt-6">
        <div className="flex flex-row justify-between">
          <div className='h-30 flex flex-row items-center gap-3'>
            <div><FaArrowLeft /></div>
            <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">My Profile</h1>
          </div>
          {/* <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">X My Profile</h1> */}
          <button className="text-red-600 border border-red-600 px-4 py-1 rounded-lg hover:bg-red-600 hover:text-white transition">
            Delete Account
          </button>
        </div>
        <div className="flex flex-col w-full bg-card shadow-md p-6 rounded-lg relative gap-12">
          <div className="flex items-center gap-4">
            <Image
              src="/profile.jpg"
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full bg-red-500"
            />
            <div>
              <h2 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">{profile.firstName}</h2>
              <p className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">{profile.email}</p>
            </div>
            <button className={`ml-auto bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 transition ${isEditable ? 'bg-gray-500 pointer-events-none' : 'null'}`}
              onClick={() => setIsEditable(true)} disabled={isEditable}>
              Edit
            </button>
          </div>

           <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="firstName"
              placeholder="Enter your first name"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!isEditable}
            />
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Enter your last name"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!isEditable}
            />
            <InputField
              label="Email ID"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditable}
            />
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="Enter your phone number"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditable}
              prefix="+91"
            />
            <InputField
              label="Location"
              name="location"
              placeholder="Enter your location"
              value={profile.location}
              onChange={handleChange}
              disabled={!isEditable}
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={profile.password}
              onChange={handleChange}
              disabled={!isEditable}
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() => isEditable && setIsPasswordVisible((prev) => !prev)}
            />
          </div>
          {/* 
          <div className="grid grid-cols-2 gap-4">
              First Name 
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                disabled={!isEditable}

              />
            </div>
              Last Name 
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
              Email ID 
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Email ID</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
              Phone Number 
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Phone Number</label>
              <div className="flex items-center border rounded-md bg-white border-gray-500">
                <span className="px-3">+91</span>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  placeholder="Enter your phone number"
                  onChange={handleChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
              Location
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                placeholder="Enter your location"
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-500 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
              Password 
            <div>
              <label className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">Password</label>
              <div className="flex items-center border rounded-md bg-white border-gray-500">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  value={profile.password}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <span className="px-3 cursor-pointer" onClick={() => isEditable && setIsPasswordVisible(prevState => !prevState)}>
                  {isPasswordVisible ? <FaEyeSlash />: <FaEye/> }
                </span>
              </div>
            </div>
          </div> */}

          <div className="flex justify-start">
            <button
              onClick={handleSave}
              className={`bg-blue-600 text-white px-14 py-2 rounded-lg hover:bg-blue-700 transition ${isEditable ? 'null' : 'bg-gray-500 pointer-events-none'}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
