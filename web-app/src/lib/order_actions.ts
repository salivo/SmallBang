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

export async function getOrderById(id: string) {
  try {
    await loginAsDepo();
    return await pb.collection("orders").getFirstListItem(`id="${id}"`);
  } catch (error: any) {
    if (error.status === 404) {
      return { notfound: true };
    }
    throw new Error("An error occurred while checking email");
  }
}

export async function createOrder(order: any) {
  try {
    await loginAsDepo();
    return await pb.collection("orders").create(order);
  } catch (error: any) {
    throw new Error("An error occurred while creating order");
  }
}

export async function updateOrder(id: string, order: any) {
  try {
    await loginAsDepo();
    return await pb.collection("orders").update(id, order);
  } catch (error: any) {
    throw new Error("An error occurred while updating order");
  }
}

export async function deleteOrder(id: string) {
  try {
    await loginAsDepo();
    return await pb.collection("orders").delete(id);
  } catch (error: any) {
    throw new Error("An error occurred while deleting order");
  }
}

export async function getCouriers() {
  try {
    await loginAsDepo();
    const couriers = await pb.collection("couriers").getFullList({
      sort: "name",
    });

    return couriers.map((courier: any) => ({
      id: courier.id,
      name: courier.name,
    }));
  } catch (error: any) {
    console.error("Error fetching couriers:", error);
    throw new Error("An error occurred while fetching couriers");
  }
}
