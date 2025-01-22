'use client'
import CategoryBar from '@/components/explore/CategoryBar'
import CommunitySection from '@/components/explore/CommunitySection'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

function page() {
    const [category, setCategory] = useState<any>([])
    const [selectedCategory,setSelectedCategory] = useState<string>(category.length>0 ?category[0]._id:"")
    useEffect(()=>{
        const fetchCategory = async ()=>{
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`)
            console.log("@category",response.data.data)
            setCategory(response.data.data)
            setSelectedCategory(response.data.data[0])
        }
        fetchCategory()
    },[])
    useEffect(()=>{
        console.log("@SelectedCategory",selectedCategory)
    },[selectedCategory])
  return (
   <div>
    <div className='w-screen overflow-scroll whitespace-nowrap [&::-webkit-scrollbar]:hidden'>
    <CategoryBar categorys={category} selectCategory={setSelectedCategory}/>
    </div>
    <div className='pl-6'>
    <h1 className='bg-black pt-20 text-white'>Top Communities</h1>
    <CommunitySection activeCategory={selectedCategory}/>
    <div>Trending tags </div>
    </div>
   </div>
)
}

export default page