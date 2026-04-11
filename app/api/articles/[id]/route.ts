import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function normalizeArticleType(value: unknown): "บทความ" | "ข่าว" {
  return value === "ข่าว" || value === "news" ? "ข่าว" : "บทความ";
}

// GET /api/articles/[id] — Get single article
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/articles/[id] — Update article
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.article_type !== undefined || body.articleType !== undefined)
      updateData.article_type = normalizeArticleType(
        body.article_type ?? body.articleType,
      );
    if (body.status !== undefined) updateData.status = body.status;
    if (body.meta_title !== undefined || body.metaTitle !== undefined)
      updateData.meta_title = body.meta_title ?? body.metaTitle;
    if (
      body.meta_description !== undefined ||
      body.metaDescription !== undefined
    )
      updateData.meta_description =
        body.meta_description ?? body.metaDescription;
    if (body.image_alt_text !== undefined || body.imageAltText !== undefined)
      updateData.image_alt_text = body.image_alt_text ?? body.imageAltText;
    if (body.focus_keyword !== undefined || body.focusKeyword !== undefined)
      updateData.focus_keyword = body.focus_keyword ?? body.focusKeyword;
    // English translations
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.excerpt_en !== undefined) updateData.excerpt_en = body.excerpt_en;
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.meta_title_en !== undefined)
      updateData.meta_title_en = body.meta_title_en;
    if (body.meta_description_en !== undefined)
      updateData.meta_description_en = body.meta_description_en;
    if (body.image_alt_text_en !== undefined)
      updateData.image_alt_text_en = body.image_alt_text_en;
    // Chinese translations
    if (body.title_cn !== undefined) updateData.title_cn = body.title_cn;
    if (body.excerpt_cn !== undefined) updateData.excerpt_cn = body.excerpt_cn;
    if (body.content_cn !== undefined) updateData.content_cn = body.content_cn;
    if (body.meta_title_cn !== undefined)
      updateData.meta_title_cn = body.meta_title_cn;
    if (body.meta_description_cn !== undefined)
      updateData.meta_description_cn = body.meta_description_cn;
    if (body.image_alt_text_cn !== undefined)
      updateData.image_alt_text_cn = body.image_alt_text_cn;

    const { data, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/articles/[id] — Delete article
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Article deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
