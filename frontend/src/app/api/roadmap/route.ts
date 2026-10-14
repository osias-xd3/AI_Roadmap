import { NextResponse } from "next/server";
import roadmapData from "@/data/roadmap_v3.json";

export async function GET() {
  try {
    return NextResponse.json(roadmapData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load roadmap data", details: error.message },
      { status: 500 }
    );
  }
}
