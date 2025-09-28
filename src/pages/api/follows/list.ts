import { supabase } from "@/lib/supabase";

export async function post({ request }: { request: Request }) {
  const { userId } = await request.json();

  // Seguidores
  const { data: followers } = await supabase
    .from("follows")
    .select("follower_id, profiles!follows_follower_id_fkey(id,nombre,apellidos,avatar_url)")
    .eq("followed_id", userId);

  // Siguiendo
  const { data: following } = await supabase
    .from("follows")
    .select("followed_id, profiles!follows_followed_id_fkey(id,nombre,apellidos,avatar_url)")
    .eq("follower_id", userId);

  return new Response(JSON.stringify({ followers, following }), { status: 200 });
}
