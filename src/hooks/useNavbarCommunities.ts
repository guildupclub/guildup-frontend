import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { RootState } from "@/redux/store";
import { setActiveCommunity } from "@/redux/channelSlice";
import { setCommunityData } from "@/redux/communitySlice";
import { setUserFollowedCommunities } from "@/redux/userSlice";

export const useNavbarCommunities = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [fetchedCommunities, setFetchedCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const activeCommunity = useSelector(
    (state: any) => state.channel.activeCommunity
  );
  const communities = useSelector(
    (state: RootState) => state?.user?.userFollowedCommunities
  );

  const userId = user?._id;

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
          { userId }
        );
        setFetchedCommunities(res.data.data);
        dispatch(setUserFollowedCommunities(res.data.data));
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    }
    if (userId) {
      fetchCommunities();
    }
  }, [userId, dispatch]);

  const getFirstValidCommunity = () => {
    return fetchedCommunities.find((community) => community && community._id);
  };

  const getMySpaceLink = () => {
    const COMMUNITY_PATH = "/community";
    const PROFILE_PATH = "/profile";
    const NO_COMMUNITIES_AVAILABLE = "/no-community";

    if (activeCommunity?.id) {
      const cleanedCommunityName = activeCommunity.name
        ? activeCommunity.name
            .replace(/\s+/g, "-")
            .replace(/\|/g, "-")
            .replace(/-+/g, "-")
        : "";
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${activeCommunity.id}`;
      return `${COMMUNITY_PATH}/${communityParams}${PROFILE_PATH}`;
    } else {
      const firstCommunity = getFirstValidCommunity();
      if (firstCommunity) {
        dispatch(
          setActiveCommunity({
            id: firstCommunity._id,
            name: firstCommunity.name,
            image: firstCommunity.image || "",
            background_image: firstCommunity.background_image || "",
            user_isBankDetailsAdded: false,
            user_iscalendarConnected: false,
          })
        );
        if (user?._id) {
          dispatch(
            setCommunityData({
              communityId: firstCommunity._id,
              userId: user._id,
            })
          );
        }
        return `${COMMUNITY_PATH}/${firstCommunity._id}${PROFILE_PATH}`;
      }
      return NO_COMMUNITIES_AVAILABLE;
    }
  };

  const handleSelectCommunity = (community: any, closeSidebar?: () => void) => {
    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
        image: community.image || "",
        background_image: community.background_image || "",
        user_isBankDetailsAdded: false,
        user_iscalendarConnected: false,
      })
    );

    if (user?._id) {
      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: user._id,
        })
      );
    }
    router.push(`/community/${community._id}/feed`);
    closeSidebar?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    communities,
    activeCommunity,
    selectedCommunity,
    setSelectedCommunity,
    getMySpaceLink,
    handleSelectCommunity,
    getInitials,
  };
}; 