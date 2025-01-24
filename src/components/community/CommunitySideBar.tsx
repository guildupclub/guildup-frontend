import React,{useState,useEffect} from 'react'
import { Button } from "@/components/ui/button"
import axios from "axios"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, Hash, Users, Calendar, Megaphone, FileEdit } from 'lucide-react'

interface CommunitySideBarProps {
  communityName?: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
  communityId: string
}

function CommunitySideBar({ communityId, communityName = "Community Name",  onTabChange,
    activeTab }: CommunitySideBarProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [channels, setChannels] = useState<any>(null)

  console.log("@communityID",communityId)
  const navItems = [
    { icon: <FileEdit size={20} />, label: "Feed", id: "feed" },
    { icon: <Users size={20} />, label: "Members", id: "members" },
    { icon: <Calendar size={20} />, label: "Events", id: "events" },
    { icon: <Megaphone size={20} />, label: "Announcements", id: "announcements" },
 ]



  useEffect(()=>{
    const communityChannel = async()=>{
      const channel = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/getChannels`,{
        "userId": "678ce60732c37c1222f913e0",
        "session": "WRdSkEhA",
        "communityId": communityId
      })
      console.log(channel.data)
      setChannels(channel.data.data)

    }
    communityChannel()
  },[communityId])
  return (
    <div className="w-64 h-screen bg-background border-none rounded-r-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-[1px] ml-4 mr-4 ">
        <h2 className="font-semibold text-xl mb-2">{communityName}</h2>
        <Button className=" w-full bg-black">Create</Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
      {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left hover:bg-[#555454] ${
              activeTab === item.id ? 'bg-black' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        {/* Channels Section */}
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="space-y-2 mt-4"
        >
          <CollapsibleTrigger className="flex items-center gap-1 px-2 py-1.5 w-full hover:bg-accent rounded-md">
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${
                isOpen ? "transform rotate-0" : "transform -rotate-90"
              }`}
            />
            <span className="font-medium text-sm">Channels</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {channels?.map((channel:any) => (
              <a
                key={channel._id}
                href={channel.href}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md hover:bg-[#555454] text-sm"
              >
                <Hash size={18} />
                {channel.name}
              </a>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </nav>
    </div>
  )
}

export default CommunitySideBar