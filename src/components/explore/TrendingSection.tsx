import axios from "axios";
import React, { useEffect, useState } from "react";
import { StringConstants } from "../common/CommonText";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import CreatorForm from "../form/CreatorForm";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import FooterLinks from "../layout/sidebars/FootLinks";
interface TrendingCategory {
  _id: string;
  name: string;
  num_communities: number;
}

function TrendingSection() {
  const { data: session } = useSession();
  const [trendingCategories, setTrendingCategories] = useState<
    TrendingCategory[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;

  useEffect(() => {
    console.log("BACKEND_URL", `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}`);
    const fetchTrendingCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category/trending`
        );

        if (response && response.data && response.data.r === "s") {
          setTrendingCategories(response.data.data);
        } else {
          console.error("Failed to fetch trending categories", response.data);
        }
      } catch (error) {
        console.error("Error fetching trending categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCategories();
  }, []);

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Please sign in to Build your Guild", {
        action: {
          label: "Sign In",
          onClick: () => signIn(),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-12">
      {/* Trending Tags Section */}
      {!isCreator && (
        <div className="bg-card rounded-xl p-4 w-full space-y-4 shadow-sm border border-zinc-200/30">
          <h1 className="font-semibold  font-sans">
            Ready to Turn Your Expertise into income?
          </h1>
          <Dialog
            open={session ? isDialogOpen : false}
            onOpenChange={setIsDialogOpen}
          >
            <Button
              className="w-full text-white shadow-md"
              onClick={handleCreatorButtonClick}
            >
              {StringConstants.CREATE_A_PAGE}
            </Button>

            {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
          </Dialog>
        </div>
      )}
      <div className="bg-card p-4 rounded-lg h-[500px] overflow-auto scrollbar-none border border-zinc-200/30">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 border-zinc-200/50">
          Trending Tags
        </h2>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-2 border-b border-background">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trendingCategories.length > 0 ? (
          <div className="space-y-3">
            {trendingCategories.map((category) => (
              <div
                key={category._id}
                className="p-2 border-b border-zinc-200/30 hover:bg-muted/10 transition-colors rounded-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.num_communities} Guilds
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {StringConstants.NO_TRENDING_CATEGORIES}
          </div>
        )}
      </div>
       <FooterLinks />
    </div>
  );
}

export default TrendingSection;
