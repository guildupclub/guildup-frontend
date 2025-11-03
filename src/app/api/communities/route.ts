import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    // Read the JSON file from the root level
    const filePath = path.join(process.cwd(), "communities.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Communities file not found. Please run 'npm run fetch-communities' first." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const communities = JSON.parse(fileContent);

    return NextResponse.json(communities, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error reading communities file:", error);
    return NextResponse.json(
      { error: "Failed to read communities file", message: error.message },
      { status: 500 }
    );
  }
}

