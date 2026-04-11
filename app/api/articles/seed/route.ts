import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { seedArticles } from "@/lib/mock/articles-seed";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingSlugs = new Set<string>();
    const { data: existing } = await supabase
      .from("articles")
      .select("slug");
    if (existing) {
      existing.forEach((a) => existingSlugs.add(a.slug));
    }

    const toInsert = seedArticles
      .filter((a) => !existingSlugs.has(a.slug))
      .map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        thumbnail: a.thumbnail || "",
        article_type: a.article_type === "ข่าว" ? "ข่าว" as const : "บทความ" as const,
        status: "published" as const,
        author_id: user.id,
        title_en: a.title_en || "",
        excerpt_en: a.excerpt_en || "",
        content_en: a.content_en || "",
        title_cn: a.title_cn || "",
        excerpt_cn: a.excerpt_cn || "",
        content_cn: a.content_cn || "",
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({
        message: "All articles already exist",
        inserted: 0,
        skipped: seedArticles.length,
      });
    }

    const { data, error } = await supabase
      .from("articles")
      .insert(toInsert)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Inserted ${data.length} articles`,
      inserted: data.length,
      skipped: seedArticles.length - toInsert.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
