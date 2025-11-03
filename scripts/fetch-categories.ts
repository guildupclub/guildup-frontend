import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface Category {
  _id: string;
  name: string;
  [key: string]: any;
}

async function fetchCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";
    
    if (!apiUrl) {
      console.error("❌ NEXT_PUBLIC_BACKEND_BASE_URL is not set");
      process.exit(1);
    }

    console.log("🔍 Fetching all categories from API...");
    console.log("🌐 API URL:", apiUrl);

    // Fetch all categories
    const url = `${apiUrl}/v1/category`;

    console.log("📦 Request URL:", url);

    const res = await axios.get(url);

    console.log("✅ Response status:", res.status);
    console.log("📥 Response data keys:", Object.keys(res.data || {}));

    // Handle different response formats
    let categoriesData: Category[] = [];
    let rawData: any[] = [];
    
    // Check if response has data property with categories array
    if (res.data.r === "s" && Array.isArray(res.data.data)) {
      rawData = res.data.data;
      console.log("✅ Success format detected, raw items:", rawData.length);
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

    // Extract category objects (they might be nested)
    categoriesData = rawData.map((item: any) => {
      if (item.category) {
        return item.category;
      }
      return item;
    }).filter((category: any) => category && (category._id || category.id));

    console.log("✅ Extracted categories:", categoriesData.length);

    if (categoriesData.length === 0) {
      console.warn("⚠️ No categories found in response");
    }

    // Save to JSON file at root level
    const filePath = path.join(process.cwd(), "categories.json");
    fs.writeFileSync(filePath, JSON.stringify(categoriesData, null, 2), "utf-8");

    console.log("✅ Successfully saved", categoriesData.length, "categories to", filePath);
    console.log("📊 Sample category:", categoriesData[0] ? {
      _id: categoriesData[0]._id || categoriesData[0].id,
      name: categoriesData[0].name,
    } : "N/A");
  } catch (error: any) {
    console.error("❌ Error fetching categories:", error.message);
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

fetchCategories();

