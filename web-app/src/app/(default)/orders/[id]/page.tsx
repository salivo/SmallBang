"use client";
import { useParams } from "next/navigation";

export default function OrderPage() {
  const { id } = useParams();

  return (
    <>
      <h1>Order Details</h1>
      <p>Order ID: {id}</p>
    </>
  );
}
