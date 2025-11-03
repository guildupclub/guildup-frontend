import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    // Read the JSON file from the root level
    const filePath = path.join(process.cwd(), "categories.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Categories file not found. Please run 'npm run fetch-categories' first." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const categories = JSON.parse(fileContent);

    return NextResponse.json(categories, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error reading categories file:", error);
    return NextResponse.json(
      { error: "Failed to read categories file", message: error.message },
      { status: 500 }
    );
  }
}

