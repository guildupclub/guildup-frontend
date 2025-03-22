import React from "react";

export default function Header() {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-[29px]">
      <h1 className="text-2xl font-bold">Discover Experts</h1>
      <p className="mt-2 text-[15px] leading-tight text-muted-foreground">
        Why figure it out alone when you can learn from someone who&rsquo;s
        already
        <br /> nailed it? Tech, Careers, Finance, and beyond!
      </p>
    </div>
  );
}
