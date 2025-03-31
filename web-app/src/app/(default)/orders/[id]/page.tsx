"use client";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/order_actions";

export default function OrderPage() {
  const { id } = useParams();
  const order = getOrderById(id as string);
  console.log(order);
  return (
    <>
      <h1>Order Details</h1>
      <p>Order ID: {id}</p>
    </>
  );
}
