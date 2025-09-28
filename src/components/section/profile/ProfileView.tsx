import { useState, useEffect } from "react";

type User = {
  id: string;
  nombre?: string;
  apellidos?: string;
  avatar_url?: string;
  bio?: string;
};

type ProfileViewProps = {
  profile: User;
  currentUser?: User;
  initialFollowers?: any[];
  initialFollowing?: any[];
  isFollowing: boolean;
};

export default function ProfileView({ profile, currentUser, initialFollowers, initialFollowing, isFollowing }: ProfileViewProps) {
  const [followers, setFollowers] = useState(initialFollowers || []);
  const [following, setFollowing] = useState(initialFollowing || []);
  const [followingStatus, setFollowingStatus] = useState(isFollowing);

  const toggleFollow = async () => {
    const res = await fetch("/api/follows/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profile.id })
    });

    if (res.ok) {
      const data = await res.json();
      setFollowingStatus(data.following);

      // refrescar listas en tiempo real
      await refreshFollowers();
    }
  };

  const refreshFollowers = async () => {
    const res = await fetch("/api/follows/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profile.id })
    });
    const data = await res.json();
    setFollowers(data.followers);
    setFollowing(data.following);
  };

  return (
    <section className="max-w-4xl mx-auto mt-8 px-4">
      {/* portada */}
      <div className="relative rounded-xl shadow">
        <img
          src="https://images.unsplash.com/photo-1503264116251-35a269479413"
          alt="Portada"
          className="w-full h-48 object-cover"
        />

        <div className="absolute w-full -bottom-16 md:-bottom-12 flex flex-col items-center md:flex-row md:justify-start md:space-x-4">
          <img
            src={profile.avatar_url ?? "/default-avatar.webp"}
            alt="Avatar"
            className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
          />

          <div className="bg-white flex flex-col w-full p-4 shadow rounded-md text-black dark:bg-emerald-900">
            <h1 className="text-xl font-bold">
              {profile.nombre} {profile.apellidos}
            </h1>

            <div className="flex items-center flex-wrap gap-3 mt-2">
              {currentUser?.id === profile.id ? (
                <a
                  href="/perfil/editar"
                  className="px-4 py-2 rounded-lg bg-accent-a0 text-white font-medium hover:bg-accent-a10"
                >
                  Editar perfil
                </a>
              ) : (
                <>
                  <button
                    onClick={toggleFollow}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 flex items-center gap-1"
                  >
                    {followingStatus ? "✓ Siguiendo" : "+ Seguir"}
                  </button>

                  <button className="px-3 py-1 rounded-lg border text-emerald-700 dark:text-emerald-300">
                    Mensaje
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-row justify-start items-center text-center gap-6 border-t mt-4 pt-2">
              <div>
                <p className="font-bold text-lg text-emerald-700">{following.length}</p>
                <span className="text-sm text-gray-500">Siguiendo</span>
              </div>
              <div>
                <p className="font-bold text-lg text-emerald-700">{followers.length}</p>
                <span className="text-sm text-gray-500">Seguidores</span>
              </div>
            </div>

            <p className="mt-3 text-gray-700 dark:text-gray-200">
              {profile.bio ?? "Este usuario aún no ha escrito una biografía."}
            </p>
          </div>
        </div>
      </div>

      {/* Seguidores */}
      <div className="mt-16 bg-white dark:bg-emerald-900 border rounded-xl shadow p-6">
        <h2 className="font-bold text-lg mb-4">Seguidores</h2>
        <ul className="space-y-2">
          {followers.map(f => (
            <li key={f.id} className="flex items-center gap-3">
              <img src={f.profiles.avatar_url ?? "/default-avatar.webp"} className="h-8 w-8 rounded-full" />
              <span>{f.profiles.nombre} {f.profiles.apellidos}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Siguiendo */}
      <div className="mt-8 bg-white dark:bg-emerald-900 border rounded-xl shadow p-6">
        <h2 className="font-bold text-lg mb-4">Siguiendo</h2>
        <ul className="space-y-2">
          {following.map(f => (
            <li key={f.id} className="flex items-center gap-3">
              <img src={f.profiles.avatar_url ?? "/default-avatar.webp"} className="h-8 w-8 rounded-full" />
              <span>{f.profiles.nombre} {f.profiles.apellidos}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
