import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface Community {
  _id: string;
  name: string;
  [key: string]: any;
}

async function fetchCommunities() {
  try {
    const apiUrl = "https://guildup-be-569548341732.asia-south1.run.app";
    
    if (!apiUrl) {
      console.error("❌ NEXT_PUBLIC_BACKEND_BASE_URL is not set");
      process.exit(1);
    }

    console.log("🔍 Fetching all communities from API...");
    console.log("🌐 API URL:", apiUrl);

    // Fetch all communities using the /all endpoint (not user-centric)
    // Use a large limit to get all communities in one request
    const url = `${apiUrl}/v1/community/all?page=0&limit=1000`;

    console.log("📦 Request URL:", url);

    const res = await axios.get(url);

    console.log("✅ Response status:", res.status);
    console.log("📥 Response data keys:", Object.keys(res.data || {}));

    // Handle different response formats
    let communitiesData: Community[] = [];
    let rawData: any[] = [];
    
    // Check if response has data property with communities array
    if (res.data.r === "s" && Array.isArray(res.data.data)) {
      rawData = res.data.data;
      console.log("✅ Success format detected, raw items:", rawData.length);
    } else if (res.data.r === "s" && res.data.data && Array.isArray(res.data.data.communities)) {
      // Handle paginated response format
      rawData = res.data.data.communities;
      console.log("✅ Paginated format detected, raw items:", rawData.length);
    } else if (Array.isArray(res.data.data)) {
      rawData = res.data.data;
      console.log("⚠️ Direct data array format detected, raw items:", rawData.length);
    } else if (Array.isArray(res.data)) {
      rawData = res.data;
      console.log("⚠️ Direct array format detected, raw items:", rawData.length);
    } else {
      console.error("❌ Unexpected response format:", JSON.stringify(res.data, null, 2));
      process.exit(1);
    }

    // Extract community objects from nested structure
    // Handle cases where communities are nested in a "community" property
    communitiesData = rawData.map((item: any) => {
      if (item.community) {
        return item.community;
      }
      return item;
    }).filter((community: any) => community && community._id);

    console.log("✅ Extracted communities:", communitiesData.length);

    if (communitiesData.length === 0) {
      console.warn("⚠️ No communities found in response");
    }

    // Save to JSON file at root level
    const filePath = path.join(process.cwd(), "communities.json");
    fs.writeFileSync(filePath, JSON.stringify(communitiesData, null, 2), "utf-8");

    console.log("✅ Successfully saved", communitiesData.length, "communities to", filePath);
    console.log("📊 Sample community:", communitiesData[0] ? {
      _id: communitiesData[0]._id,
      name: communitiesData[0].name,
    } : "N/A");
  } catch (error: any) {
    console.error("❌ Error fetching communities:", error.message);
    if (error.response) {
      console.error("📛 Response error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("📛 No response received:", {
        message: error.message,
        url: error.config?.url,
      });
    }
    process.exit(1);
  }
}

fetchCommunities();

