"use server";

import { cookies } from "next/headers";
import pb from "./poketbase";

export async function loadToken() {
  const cookieStore = await cookies();
  const pb_cookie = cookieStore.get("pb_auth")?.value ?? "";
  pb.authStore.loadFromCookie(pb_cookie);
}

export async function saveToken() {
  const cookieStore = await cookies();
  const pb_cookie = pb.authStore.exportToCookie({ httpOnly: false });
  cookieStore.set("pb_auth", pb_cookie);
}

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete("pb_auth");
}
