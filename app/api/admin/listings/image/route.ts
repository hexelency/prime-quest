import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"]]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "Select an image file." }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 400 });

    const directory = path.join(process.cwd(), "public", "uploads", "listings");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/listings/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not upload image." }, { status: 500 });
  }
}
