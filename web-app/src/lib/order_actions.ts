"use server";
import { loginAsDepo } from "./auth_actions";
import pb from "@/lib/poketbase";

export async function getOrders(id: string) {
  try {
    await loginAsDepo();
    return await pb.collection("orders").getFullList({ sort: "-id" });
  } catch (error: any) {
    if (error.status === 404) {
      return { notfound: true };
    }
    throw new Error("An error occurred while checking email");
  }
}
