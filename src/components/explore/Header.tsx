import React from "react";

export default function Header() {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-4">
      <h1 className="text-2xl font-bold">Discover Experts</h1>
      <p className="mt-2 text-[15px] leading-tight text-muted-foreground px-3 md:p-0">
        Why figure it out alone when you can learn from someone who&rsquo;s
        already nailed it? <br/>Tech, Careers, Finance, and beyond!
      </p>
    </div>
  );
}
