"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useParams } from "next/navigation";

type Testimonial = {
  _id: string;
  imageUrl: string;
  userId: string;
  mediaType?: "image" | "video";
};

interface TestimonialsProps {
  communityId: string;
}

const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
export default function Testimonials({ communityId: propCommunityId }: TestimonialsProps) {
  
  const dispatch = useDispatch();
  const params = useParams();
  
  // Use prop communityId first, then fall back to URL params
  const urlCommunityId = params?.id as string;
  const urlCommunityParam = params?.["community-Id"] as string;
  const urlExtractedId = urlCommunityParam ? urlCommunityParam.substring(urlCommunityParam.lastIndexOf("-") + 1) : null;
  
  const communityId = propCommunityId || urlExtractedId || urlCommunityId;  
  // const activeCommunity = useSelector(
  //   (state: RootState) => state.channel.activeCommunity
  // );
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?._id;
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    if (!communityId) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/testimonials/${communityId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }

      const data = await response.json();

      const formatted: Testimonial[] = (data.data || []).map((url: string) => {
        const lowerUrl = url.toLowerCase();
        const isVideo = videoExtensions.some((ext) => lowerUrl.endsWith(ext));
        return {
          _id: url,
          imageUrl: url,
          userId: userId || "",
          mediaType: isVideo ? "video" : "image",
        };
      });
      setTestimonials(formatted);
      // setTestimonials(data.data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchTestimonials();
    } else {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    // Also check after a short delay to handle async loading
    const timeoutId = setTimeout(checkScroll, 100);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeoutId);
    };
  }, [testimonials]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const scrollTo = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      e.target.files.length === 0 ||
      !userId ||
      !communityId
    )
      return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("communityId", communityId);

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("testimonials", e.target.files[i]);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/testimonials/upload`,
        {
          method: "POST",
          body: formData,
        }
      );


      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error("Failed to upload testimonials");
      }


      toast({
        title: "Success",
        description: "Testimonials uploaded successfully",
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error uploading testimonials:", error);
      toast({
        title: "Error",
        description: "Failed to upload testimonials",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!selectedTestimonial || !userId || !communityId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/testimonials/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            imageUrl: selectedTestimonial?.imageUrl,
            communityId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  const openTestimonialModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading testimonials...</div>;
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          {isAdmin && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              // disabled={isUploading || !communityId || !userId}
              disabled={!isAdmin}
              className="flex items-center gap-2 text-white"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <span>Add Media</span>
                  {/* <Plus className="w-5 h-5" /> */}
                </>
              )}
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*,video/*"
          />
        </div>
      </div>

      {testimonials.length > 0 ? (
        <div className="rounded-xl py-2 relative">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <Button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 h-10 w-10"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>
          )}
          {canScrollRight && (
            <Button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 h-10 w-10"
              variant="ghost"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
          )}

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={() => {
              const container = scrollContainerRef.current;
              if (!container) return;
              setCanScrollLeft(container.scrollLeft > 0);
              setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
              );
            }}
          >
            {testimonials?.map((testimonial, index) => (
              <div
                key={index}
                className="cursor-pointer group flex-shrink-0"
                onClick={() => openTestimonialModal(testimonial)}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-64 h-64 md:w-72 md:h-72">
                    {testimonial.mediaType === "video" ? (
                      <video
                        src={testimonial.imageUrl || "/placeholder.svg"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        controls={false}
                        muted
                      />
                    ) : (
                      <img
                        src={testimonial.imageUrl || "/placeholder.svg"}
                        alt="Testimonial"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          {/* Hide scrollbar for webkit browsers */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No testimonials yet.</p>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Testimonial</DialogTitle>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="flex flex-col items-center gap-4">
              {selectedTestimonial.mediaType === "video" ? (
                <video
                  src={selectedTestimonial.imageUrl || "/placeholder.svg"}
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedTestimonial.imageUrl || "/placeholder.svg"}
                  alt="Testimonial"
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
              )}
              <DialogFooter className="w-full flex justify-between sm:justify-between">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteTestimonial}
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
