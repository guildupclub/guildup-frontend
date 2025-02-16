import HomePage from "@/components/homePageLayout/HomePage";
import { useSelector } from "react-redux";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white  pt-16">
      <HomePage />
    </div>
  );
}
