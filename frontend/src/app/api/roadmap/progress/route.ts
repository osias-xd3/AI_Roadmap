import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let uid = "guest-student";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      // In dev or guest testing
      if (token.startsWith("dev-test-token:")) {
        uid = token.replace("dev-test-token:", "");
      } else {
        // If full token, parse or use uid header if present
        uid = req.headers.get("x-user-uid") || "authenticated-user";
      }
    }

    // Try reading from Firestore
    try {
      const docRef = doc(db, "user_progress", uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return NextResponse.json(snapshot.data());
      }
    } catch (fsErr) {
      console.warn("Firestore progress read notice:", fsErr);
    }

    return NextResponse.json({
      uid,
      completed_topics: [],
      github_urls: {},
      notes: {},
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch progress", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    let uid = "guest-student";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token.startsWith("dev-test-token:")) {
        uid = token.replace("dev-test-token:", "");
      } else {
        uid = req.headers.get("x-user-uid") || body.uid || "authenticated-user";
      }
    }

    const progressData = {
      uid,
      completed_topics: body.completed_topics || [],
      github_urls: body.github_urls || {},
      notes: body.notes || {},
      updated_at: new Date().toISOString(),
    };

    // Attempt save to Firestore
    try {
      const docRef = doc(db, "user_progress", uid);
      await setDoc(docRef, progressData, { merge: true });
    } catch (fsErr) {
      console.warn("Firestore progress write notice:", fsErr);
    }

    return NextResponse.json({ status: "success", data: progressData });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save progress", details: error.message },
      { status: 500 }
    );
  }
}
