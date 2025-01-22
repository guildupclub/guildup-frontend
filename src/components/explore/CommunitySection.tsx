'use client'
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface CommunitySectionProps {
  activeCategory: any; // Replace 'any' with the appropriate type if known
}

function CommunitySection({ activeCategory }: CommunitySectionProps) {
    console.log("@this is community section",activeCategory)
    const [communitys, setCommunitys] = useState([])
    useEffect(()=>{
        const fetchTopCommunity=async()=>{
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/search`,{
                categoryId:activeCategory
            })
            console.log("@responseCategoryDAta",response)
            setCommunitys(response.data.data)
        }
        if(activeCategory !=""){
            fetchTopCommunity()
        }
    },[activeCategory])
  return (
    <div className='bg-black min-h-screen text-white  columns-1 sm:columns-3 md:columns-4 lg:columns-5 gap-4'>
        {communitys.length>0 ? communitys?.map((community:any)=>{
            return (
                <Card
                key={community._id}
                className="mb-4 break-inside-avoid bg-gray-200 rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative aspect-video w-[150px] ">
                  <Image
                    src={community.image || ""}
                    alt={community.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Image
                      src={community.icon || ""}
                      alt={community.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <h3 className="font-semibold text-white">{community.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 max-h-[300px] truncate ">{community.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{community.num_member} members</span>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                </div>
              </Card>
            )
        }) :<div>No community found</div>}
    </div>
  )
}

export default CommunitySection