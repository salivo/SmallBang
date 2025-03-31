"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";

interface Credentials {
  email: string;
  password: string;
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Přihlášení s použitím PocketBase SDK
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

      // Používáme authWithPassword metodu, která komunikuje přímo s PocketBase API
      const authData = await pb
        .collection("users")
        .authWithPassword(credentials.email, credentials.password);

      // PocketBase automaticky uloží autentizaci do localStorage
      // Pro zajištění uchování mezi refreshi/záložkami můžeme nastavit také cookie
      document.cookie = `pb_auth=${pb.authStore.exportToCookie()}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`;

      // Přesměrování na /depo
      router.push("/depo");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Neplatné přihlašovací údaje");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Přihlášení do depo systému</h1>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.email}
              onChange={handleChange}
              placeholder="depo@depo.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Heslo
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={isLoading}
          >
            {isLoading ? "Přihlašování..." : "Přihlásit"}
          </button>
        </form>
      </div>
    </div>
  );
}
