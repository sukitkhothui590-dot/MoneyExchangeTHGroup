import { createClient } from "@/lib/supabase/client";

/**
 * Upload an image to the article-images bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadArticleImage(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `articles/${fileName}`;

  const { error } = await supabase.storage
    .from("article-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("article-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Upload a payment slip image to the slip-images bucket.
 * Returns the file path (use signed URL to access).
 */
export async function uploadSlipImage(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const { error } = await supabase.storage
    .from("slip-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return filePath;
}

/**
 * Get a signed URL for a slip image (valid for 1 hour).
 */
export async function getSlipImageUrl(filePath: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from("slip-images")
    .createSignedUrl(filePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}

/**
 * Delete an image from the article-images bucket.
 */
export async function deleteArticleImage(url: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from the public URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/article-images/");
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from("article-images")
    .remove([filePath]);

  if (error) throw error;
}
