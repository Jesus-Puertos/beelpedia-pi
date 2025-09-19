import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase"; // Cliente normal (anon key)
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY // 👈 Service Role Key
);

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const nombre = formData.get("nombre")?.toString();
  const apellidos = formData.get("apellidos")?.toString();
  const telefono = formData.get("telefono")?.toString();

  if (!email || !password || !nombre) {
    return new Response("Nombre, correo y contraseña son obligatorios", { status: 400 });
  }

  // 1️⃣ Crear usuario en Auth (puede usar el cliente normal)
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Error en signUp:", error.message);
    return new Response(error.message, { status: 500 });
  }

  let avatarUrl = null;

  // 2️⃣ Subir imagen usando supabaseServer (service role)
  const avatarFile = formData.get("avatar") as File;
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${data.user?.id}/${crypto.randomUUID()}-${avatarFile.name}`;
    const { error: uploadError } = await supabaseServer.storage
      .from("avatars")
      .upload(fileName, avatarFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Error subiendo avatar:", uploadError.message);
    } else {
      const { data: publicUrl } = supabaseServer.storage
        .from("avatars")
        .getPublicUrl(fileName);
      avatarUrl = publicUrl.publicUrl;
    }
  }

  // 3️⃣ Insertar en profiles usando supabaseServer (service role)
  if (data?.user) {
    const { error: profileError } = await supabaseServer.from("profiles").insert({
      id: data.user.id,
      nombre,
      apellidos,
      telefono,
      avatar_url: avatarUrl,
    });

    if (profileError) {
      console.error("Error insertando perfil:", profileError.message);
    }
  }

  return redirect("/verifica-tu-correo");
};
