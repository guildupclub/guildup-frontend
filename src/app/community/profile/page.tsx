import { ProfileCard } from "@/components/profile/ProfileCard";
import { profileData } from "@/components/profile/types/DataTypes";

export default function Page() {
  return (
    <div className="min-h-screen bg-background grow md:ml-6 md:py-24">
      <ProfileCard />
    </div>
  );
}
