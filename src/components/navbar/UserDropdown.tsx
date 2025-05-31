import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useNavbarAuth } from "@/hooks/useNavbarAuth";
import { useChatContext } from "@/contexts/ChatContext";

interface UserDropdownProps {
  isUser: boolean;
}

export const UserDropdown = ({ isUser }: UserDropdownProps) => {
  const { session, handleSignOut, handleSignIn } = useNavbarAuth();
  const { user } = useSelector((state: RootState) => state.user);
  const { unreadCount } = useChatContext();

  if (!user?._id) {
    return (
      <Button
        onClick={() => handleSignIn()}
        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-all duration-200"
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-50 transition-all duration-200">
            <Avatar className="h-10 w-10">
              {session?.user?.image ? (
                <AvatarImage
                  src={session?.user?.image || "/placeholder.svg"}
                  alt="User"
                />
              ) : (
                <AvatarFallback>
                  {session?.user?.name?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg"
          align="end"
        >
          <DropdownMenuItem
            asChild
            className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
          >
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
          >
            <Link href="/chat" className="flex items-center justify-between">
              <span>Chat</span>
              {user?._id && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
          >
            <Link href="/blogs">Blogs</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
          >
            <Link href="/booking">Bookings</Link>
          </DropdownMenuItem>
          {isUser && (
            <DropdownMenuItem
              asChild
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              <Link href="/payments">Payments</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-gray-50"
            onClick={handleSignOut}
          >
            {StringConstants.SIGN_OUT}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 