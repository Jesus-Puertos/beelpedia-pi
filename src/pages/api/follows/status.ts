import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const access = cookies.get("sb-access-token");
  if (!access) return new Response(JSON.stringify({ following: false }), { status: 200 });

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${access.value}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const targetId = url.searchParams.get("targetId");
  if (!user || !targetId) return new Response(JSON.stringify({ following: false }), { status: 200 });

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  return new Response(JSON.stringify({ following: !!existing }), {
    headers: { "Content-Type": "application/json" },
  });
};
