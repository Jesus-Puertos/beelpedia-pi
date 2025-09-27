import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get("sb-access-token");
  if (!accessToken) {
    return redirect("/signin");
  }

  const supabaseServer = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${accessToken.value}` } },
    }
  );

  // 🔑 Obtener usuario
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  if (userError || !user) {
    console.error("Error obteniendo usuario:", userError?.message);
    return redirect("/signin");
  }

  const formData = await request.formData();
  const nombre = formData.get("nombre")?.toString();
  const apellidos = formData.get("apellidos")?.toString();
  const telefono = formData.get("telefono")?.toString();
  const bio = formData.get("bio")?.toString();

  // 🟢 Paso 1: obtener perfil actual (para no perder datos)
  const { data: existingProfile, error: fetchError } = await supabaseServer
    .from("profiles")
    .select("nombre, apellidos, telefono, avatar_url, bio")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error obteniendo perfil actual:", fetchError.message);
  }

  let avatarUrl = existingProfile?.avatar_url || null;

  // 🟢 Paso 2: solo subir si hay nueva imagen
  const avatarFile = formData.get("avatar") as File;
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${user.id}/${crypto.randomUUID()}-${avatarFile.name}`;
    const { error: uploadError } = await supabaseServer.storage
      .from("avatars")
      .upload(fileName, avatarFile, { cacheControl: "3600", upsert: true });

    if (!uploadError) {
      const { data: publicUrl } = supabaseServer.storage
        .from("avatars")
        .getPublicUrl(fileName);
      avatarUrl = publicUrl.publicUrl;
    } else {
      console.error("Error subiendo avatar:", uploadError.message);
    }
  }

  // 🟢 Paso 3: construimos el objeto de actualización solo con campos llenos
  const updateData: Record<string, string | null> = {
    nombre: nombre || existingProfile?.nombre,
    apellidos: apellidos || existingProfile?.apellidos,
    telefono: telefono || existingProfile?.telefono,
    bio: bio || existingProfile?.bio,
    avatar_url: avatarUrl,
  };

  const { error: updateError } = await supabaseServer
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    console.error("Error actualizando perfil:", updateError.message);
    return new Response("Error al actualizar el perfil", { status: 500 });
  }

  return redirect("/perfil");
};
