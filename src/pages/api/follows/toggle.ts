import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL!,
    import.meta.env.SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken.value}` } },
    }
  );

  // usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 401 });
  }

  const body = await request.json();
  const targetId = body.targetId;

  if (!targetId) {
    return new Response(JSON.stringify({ error: "ID objetivo requerido" }), { status: 400 });
  }

  // ¿Ya lo sigue?
  const { data: existingFollow } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("followed_id", targetId)
    .single();

  if (existingFollow) {
    // si ya existe => dejar de seguir
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followed_id", targetId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ following: false }), { status: 200 });
  } else {
    // si no existe => seguir
    const { error: insertError } = await supabase
      .from("follows")
      .insert([{ follower_id: user.id, followed_id: targetId }]);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ following: true }), { status: 200 });
  }
};
