"use client";

import React, { useEffect, useState } from "react";
import { getOrders } from "@/lib/order_actions";

const DepoPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getOrders("r3ft1j25rgpypfw"); // Replace "some-id" with the actual ID
        console.log("Fetched orders:", result); // Log the data to the console
        if (Array.isArray(result)) {
          setOrders(result);
        } else {
          setError("No orders found");
          setOrders([]); // Reset to empty array
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err); // Log the error to the console
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Orders</h1>
      <ul>
        {orders.map((order, index) => (
          <li key={index}>{JSON.stringify(order)}</li>
        ))}
      </ul>
    </div>
  );
};

export default DepoPage;
