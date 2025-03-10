"use client";

import { StringConstants } from "@/components/common/CommonText";
import { useRouter } from "next/navigation";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">{StringConstants.ERROR}</h1>
      <p className="mt-4 text-lg text-gray-600">
        {StringConstants.SOMETHING_WRONG}
      </p>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push("/")}
      >
        {StringConstants.BACK_HOME}
      </button>
    </div>
  );
};

export default ErrorPage;
