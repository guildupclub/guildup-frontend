import { useState, useCallback } from 'react';
import type { User } from '@/types/auth.types';

interface UseProfileEditReturn {
  profile: User | null;
  profileCopy: User | null;
  isEditable: boolean;
  changedFields: Record<string, any>;
  avatarImgUrl: string;
  activeTab: string;
  newLanguage: string;
  setProfile: React.Dispatch<React.SetStateAction<User | null>>;
  setProfileCopy: React.Dispatch<React.SetStateAction<User | null>>;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;
  setChangedFields: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setAvatarImgUrl: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setNewLanguage: React.Dispatch<React.SetStateAction<string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddLanguage: () => void;
  handleRemoveLanguage: (language: string) => void;
  resetProfile: () => void;
  getDefaultAvatarUrl: (userData: User) => string;
}

export function useProfileEdit(initialProfile: User | null = null): UseProfileEditReturn {
  const [profile, setProfile] = useState<User | null>(initialProfile);
  const [profileCopy, setProfileCopy] = useState<User | null>(initialProfile);
  const [isEditable, setIsEditable] = useState(false);
  const [changedFields, setChangedFields] = useState<Record<string, any>>({});
  const [avatarImgUrl, setAvatarImgUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [newLanguage, setNewLanguage] = useState<string>("");

  const getDefaultAvatarUrl = useCallback((userData: User): string => {
    if (userData.avatar) {
      return userData.avatar;
    } else if (userData.image) {
      return userData.image;
    } else {
      return `https://api.dicebear.com/9.x/thumbs/svg`;
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, [name]: value } : null
    );
    setChangedFields((prevChanged) => ({ ...prevChanged, [name]: value }));
  }, [profile]);

  const handleAddLanguage = useCallback(() => {
    if (!newLanguage.trim() || !profile) return;

    const updatedLanguages = [
      ...(profile.languages || []),
      newLanguage.trim(),
    ];

    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, languages: updatedLanguages } : null
    );

    setChangedFields((prevChanged) => ({
      ...prevChanged,
      languages: updatedLanguages,
    }));

    setNewLanguage("");
  }, [newLanguage, profile]);

  const handleRemoveLanguage = useCallback((language: string) => {
    if (!profile) return;
    
    const updatedLanguages = (profile.languages || []).filter(
      (lang) => lang !== language
    );

    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, languages: updatedLanguages } : null
    );

    setChangedFields((prevChanged) => ({
      ...prevChanged,
      languages: updatedLanguages,
    }));
  }, [profile]);

  const resetProfile = useCallback(() => {
    setProfile(profileCopy);
    setChangedFields({});
    setIsEditable(false);
  }, [profileCopy]);

  return {
    profile,
    profileCopy,
    isEditable,
    changedFields,
    avatarImgUrl,
    activeTab,
    newLanguage,
    setProfile,
    setProfileCopy,
    setIsEditable,
    setChangedFields,
    setAvatarImgUrl,
    setActiveTab,
    setNewLanguage,
    handleChange,
    handleAddLanguage,
    handleRemoveLanguage,
    resetProfile,
    getDefaultAvatarUrl,
  };
} 