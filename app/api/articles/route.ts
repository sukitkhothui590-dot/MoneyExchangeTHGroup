import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function normalizeArticleType(value: unknown): "บทความ" | "ข่าว" {
  return value === "ข่าว" || value === "news" ? "ข่าว" : "บทความ";
}

// GET /api/articles — List all articles
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const publicOnly = searchParams.get("public") === "true";

    let query = supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status as "draft" | "published");
    }

    if (publicOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/articles — Create new article
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || "",
        content: body.content || "",
        thumbnail: body.thumbnail || "",
        article_type: normalizeArticleType(
          body.article_type ?? body.articleType,
        ),
        status: body.status || "draft",
        author_id: user.id,
        meta_title: body.meta_title || body.metaTitle || null,
        meta_description: body.meta_description || body.metaDescription || null,
        image_alt_text: body.image_alt_text || body.imageAltText || null,
        focus_keyword: body.focus_keyword || body.focusKeyword || null,
        // English translations
        title_en: body.title_en || "",
        excerpt_en: body.excerpt_en || "",
        content_en: body.content_en || "",
        meta_title_en: body.meta_title_en || null,
        meta_description_en: body.meta_description_en || null,
        image_alt_text_en: body.image_alt_text_en || null,
        // Chinese translations
        title_cn: body.title_cn || "",
        excerpt_cn: body.excerpt_cn || "",
        content_cn: body.content_cn || "",
        meta_title_cn: body.meta_title_cn || null,
        meta_description_cn: body.meta_description_cn || null,
        image_alt_text_cn: body.image_alt_text_cn || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
