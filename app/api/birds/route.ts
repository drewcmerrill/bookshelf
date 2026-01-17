import { NextResponse } from "next/server";
import { birds } from "@/data/birds";

export async function GET() {
  const randomIndex = Math.floor(Math.random() * birds.length);
  const bird = birds[randomIndex];

  return NextResponse.json({
    bird: bird
  });
}
