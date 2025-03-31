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

    // Log the incoming order data
    console.log("Creating order with data:", order);

    // Validate that the courier is provided
    if (!order.courier || typeof order.courier !== "string") {
      throw new Error("Courier information is missing or invalid");
    }

    // Ensure the courier exists in the database
    const courier = await pb
      .collection("couriers")
      .getFirstListItem(`id="${order.courier}"`);
    if (!courier) {
      throw new Error("Specified courier does not exist");
    }

    // Log the courier data
    console.log("Courier found:", courier);

    // Map the courier field to courier_id for the database
    const orderData = {
      ...order,
      courier_id: order.courier, // Map courier to courier_id
    };
    delete orderData.courier; // Remove the original courier field if necessary

    // Log the final order data being sent to the database
    console.log("Final order data being sent to the database:", orderData);

    // Proceed to create the order
    const createdOrder = await pb.collection("orders").create(orderData);

    // Log the created order data
    console.log("Order successfully created:", createdOrder);

    return createdOrder;
  } catch (error: any) {
    console.error("Error creating order:", error);
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

export async function createCourier(courier: any) {
  try {
    await loginAsDepo();

    // Validate that the courier data is provided and valid
    if (!courier.name || typeof courier.name !== "string") {
      throw new Error("Courier name is missing or invalid");
    }

    // Log the incoming courier data
    console.log("Creating courier with data:", courier);

    // Prepare the courier data for the database
    const courierData = {
      name: courier.name,
      ...(courier.email && { email: courier.email }), // Optional email field
    };

    // Create the courier in the database
    const createdCourier = await pb.collection("couriers").create(courierData);

    // Log the created courier data
    console.log("Courier successfully created:", createdCourier);

    return createdCourier;
  } catch (error: any) {
    console.error("Error creating courier:", error);
    throw new Error("An error occurred while creating courier");
  }
}
