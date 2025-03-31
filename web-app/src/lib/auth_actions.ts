"use server";

import pb from "@/lib/poketbase";
import { clearToken, loadToken, saveToken } from "./pocketbase_actions";

export async function loginAction(formData: FormData) {
  const { email, password } = getFormCredential(formData);
  const result = await pb.collection("users").authWithPassword(email, password);
  await saveToken();
  return result;
}

export async function registerAction(formData: FormData) {
  const new_user = convertFormData(formData);
  const email = await getUserByEmail(new_user.email);
  if (email.notfound) {
    await createUser(new_user);
    await loginAction(formData);
    return "User registered successfully";
  } else {
    throw new Error("User already exists");
  }
}

export async function logoutAction() {
  await clearToken();
}

export async function getUserAuthState() {
  await loadToken();
  return pb.authStore.isValid;
}

export async function getUserName() {
  await loadToken();
  const name = pb.authStore.record?.name ?? "";
  return name;
}

async function getUserByEmail(email: string) {
  try {
    await loginAsSuperUser();
    return await pb.collection("users").getFirstListItem(`email="${email}"`);
  } catch (error: any) {
    if (error.status === 404) {
      return { notfound: true };
    }
    throw new Error("An error occurred while checking email");
  }
}

async function createUser(new_user: any) {
  await loginAsSuperUser();
  await pb.collection("users").create(new_user);
}

function convertFormData(formData: FormData) {
  return {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
    passwordConfirm: formData.get("password") as string,
  };
}
function getFormCredential(formData: FormData) {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  return { email, password };
}

async function loginAsSuperUser() {
  const email = process.env.PB_ADMIN_EMAIL ?? "";
  const password = process.env.PB_ADMIN_PASS ?? "";
  await pb.collection("_superusers").authWithPassword(email, password);
}
