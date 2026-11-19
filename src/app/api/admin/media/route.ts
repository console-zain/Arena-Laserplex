import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { mediaCategories } from "@/lib/media-keys";
import {
  MAX_IMAGE_SIZE_BYTES,
  MediaServiceError,
  deleteImage,
  uploadImage,
} from "@/server/services/media";

export const runtime = "nodejs";

const deleteSchema = z.object({
  key: z.string().min(1).max(128),
  category: z.enum(mediaCategories),
});

function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    const expectedOrigin = new URL(
      process.env.BETTER_AUTH_URL || siteConfig.url,
    ).origin;
    return new URL(origin).origin === expectedOrigin;
  } catch {
    return false;
  }
}

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.role === "ADMIN" && session.user.status === "ACTIVE"
    ? session
    : null;
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    !Number.isSafeInteger(contentLength) ||
    contentLength < 1 ||
    contentLength > MAX_IMAGE_SIZE_BYTES + 64 * 1024
  ) {
    return NextResponse.json(
      { error: "Image upload must be 5 MB or smaller." },
      { status: 413 },
    );
  }

  try {
    const formData = await request.formData();
    const category = z.enum(mediaCategories).parse(formData.get("category"));
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    return NextResponse.json(await uploadImage(file, category), { status: 201 });
  } catch (error) {
    if (error instanceof MediaServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Choose a valid media category." }, { status: 400 });
    }

    console.error("R2 image upload failed.", error);
    return NextResponse.json({ error: "Image upload failed. Try again later." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  const session = await adminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  try {
    const input = deleteSchema.parse(await request.json());
    await deleteImage(input.key, input.category);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof MediaServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "Choose a valid media object." }, { status: 400 });
    }

    console.error("R2 image deletion failed.", error);
    return NextResponse.json({ error: "Image deletion failed. Try again later." }, { status: 500 });
  }
}
