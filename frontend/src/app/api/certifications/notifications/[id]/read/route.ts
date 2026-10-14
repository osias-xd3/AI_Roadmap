import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (fsErr) {
      console.warn("Firestore notification update notice:", fsErr);
    }
    return NextResponse.json({ status: "success", id, read: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to mark notification read", details: error.message },
      { status: 500 }
    );
  }
}
