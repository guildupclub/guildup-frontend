import { ProfileCard } from "@/components/profile/ProfileCard";
import { profileData } from "@/components/profile/types/DataTypes";

export default function Page() {
  return (
    <div className="min-h-screen bg-black p-8">
      <ProfileCard {...profileData} />
    </div>
  );
}
