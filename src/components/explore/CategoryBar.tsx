import React from 'react'

interface Category {
  name: string;
}

interface CategoryBarProps {
  categorys: Category[];
  selectCategory: (a:string)=> void;
}

function CategoryBar({ categorys ,selectCategory}: CategoryBarProps) {
  return (
    <div className="bg-black pt-20 text-white flex gap-4 pl-2 pr-2 ">
    {categorys?.map((cat:any)=>(<ul className='text-sm cursor-pointer hover:text-purple-700 ' onClick={()=>selectCategory(cat._id)} key={cat.name}>{cat.name}</ul>))}
 </div>
  )
}

export default CategoryBar