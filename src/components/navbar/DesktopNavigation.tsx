import Link from "next/link";
import { Compass, Users, MessageCircle } from "lucide-react";
import { MdOutlineRssFeed } from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useChatContext } from "@/contexts/ChatContext";

interface DesktopNavigationProps {
  isActive: (path: string) => boolean;
  getMySpaceLink: () => string;
}

export const DesktopNavigation = ({ isActive, getMySpaceLink }: DesktopNavigationProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  const { unreadCount } = useChatContext();

  return (
    <div className="hidden md:flex items-center justify-center">
      <ul className="flex items-center space-x-2 text-gray-600">
        <li className="px-4 py-2 rounded-full transition-all duration-200">
          <Link href="/" className="flex flex-col items-center">
            <Compass
              className={`h-5 w-5 ${
                isActive("/") ? "text-primary" : ""
              }`}
            />
            <span
              className={`text-sm mt-1 ${
                isActive("/") ? "text-primary font-medium" : ""
              }`}
            >
              {StringConstants.EXPLORE}
            </span>
          </Link>
        </li>

        <li className="px-4 py-2 rounded-full transition-all duration-200">
          <Link href="/feeds" className="flex flex-col items-center">
            <MdOutlineRssFeed
              className={`h-5 w-5 ${
                isActive("/feeds") ? "text-primary" : ""
              }`}
            />
            <span
              className={`text-sm mt-1 ${
                isActive("/feeds") ? "text-primary font-medium" : ""
              }`}
            >
              {StringConstants.FEED}
            </span>
          </Link>
        </li>
        
        <li className="px-4 py-2 rounded-full transition-all duration-200">
          <Link
            href={getMySpaceLink()}
            className="flex flex-col items-center"
          >
            <Users
              className={`w-5 h-5 ${
                isActive("/community") ? "text-primary" : ""
              }`}
            />
            <span
              className={`text-sm mt-1 ${
                isActive("/community")
                  ? "text-primary font-medium"
                  : ""
              }`}
            >
              {StringConstants.MY_SPACE}
            </span>
          </Link>
        </li>

        <li className="px-4 py-2 rounded-full transition-all duration-200">
          <Link href="/chat" className="flex flex-col items-center relative">
            <MessageCircle
              className={`h-5 w-5 ${
                isActive("/chat") ? "text-primary" : ""
              }`}
            />
            {user?._id && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span
              className={`text-sm mt-1 ${
                isActive("/chat") ? "text-primary font-medium" : ""
              }`}
            >
              Chat
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}; 