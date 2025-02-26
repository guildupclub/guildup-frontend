// "use client";

// import { BookingDialog } from "@/components/booking/Bookingdialog";
// import { RootState } from "@/redux/store";
// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react";
// import { useSelector } from "react-redux";

// interface Offering {
//   _id: string;
//   title: string;
//   description: string;
//   type: string;
//   price: {
//     amount: number;
//     currency: string;
//   };
//   duration: number;
//   is_free: boolean;
//   tags: string[];
//   rating: number;
//   total_ratings: number;
// }

// export default function Page() {
//   const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
//     null
//   );
//   const [offerings, setOfferings] = useState<Offering[] | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const user = useSelector((state: RootState) => state.user.user);
//   const community = useSelector((state: RootState) => state.community);

//   const fetchOfferings = useCallback(async () => {
//     if (!community?.communityId) {
//       console.log("No community ID found, skipping API call.");
//       return;
//     }

//     setLoading(true);
//     console.log("Fetching offerings for community ID:", community.communityId);

//     try {
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${community.communityId}`
//       );

//       if (response.data.r === "s") {
//         setOfferings(
//           Array.isArray(response.data.data)
//             ? response.data.data
//             : [response.data.data]
//         );
//         console.log("Offerings fetched successfully:", response.data.data);
//       } else {
//         console.error("Unexpected response format:", response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching offerings:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [community?.communityId]);

//   useEffect(() => {
//     fetchOfferings();
//   }, [fetchOfferings]);

//   return (
//     <div className="p-6">
//       <h1 className="text-5xl font-bold py-6">Hello</h1>

//       {loading ? (
//         <div className="text-center py-4">Loading offerings...</div>
//       ) : offerings && offerings.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {offerings.map((offering) => (
//             <div
//               key={offering._id}
//               className="border p-4 rounded-lg shadow-md cursor-pointer"
//               onClick={() => setSelectedOffering(offering)}
//             >
//               <h2 className="text-xl font-semibold">{offering.title}</h2>
//               <p className="text-gray-600">{offering.description}</p>
//               <p className="font-bold mt-2">
//                 {offering.price.amount} {offering.price.currency}
//               </p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-4">No offerings available.</div>
//       )}

//       {selectedOffering && (
//         <BookingDialog
//           offering={selectedOffering}
//           isOpen={!!selectedOffering}
//           onClose={() => setSelectedOffering(null)}
//         />
//       )}
//     </div>
//   );
// }
