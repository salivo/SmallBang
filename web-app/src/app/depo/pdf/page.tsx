"use client";

import { useState, useEffect } from "react";
import { generatePDF } from "@/lib/pdf_gen";
import {
  createOrder,
  getCouriers,
  deleteOrder,
  getOrders,
} from "@/lib/order_actions";

interface Order {
  id: string;
  Customer_name: string;
  Customer_address: string;
  Customer_tel: string;
  Customer_email: string;
  Sender_address: string;
  courier_id: string;
  Delivery_state: string;
}

export default function PDFGenerator() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleGeneratePDF = async (customerName: string, customerAddress: string, id: string) => {
    setLoading(true);
    const pdfBytes = await generatePDF({
      qrString: id,
      name: customerName,
      address: customerAddress,
    });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "order_sheet.pdf";
    link.click();
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mt-6 w-full">
        {loading && <div>Loading orders...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!loading && !error && orders.length > 0 && (
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-b text-left">Customer Name</th>
                <th className="px-4 py-2 border-b text-left">Address</th>
                <th className="px-4 py-2 border-b text-left">Delivery Status</th>
                <th className="px-4 py-2 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">{order.Customer_name}</td>
                  <td className="px-4 py-2">{order.Customer_address}</td>
                  <td className="px-4 py-2">{order.Delivery_state}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleGeneratePDF(order.Customer_name, order.Customer_address, order.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
                    >
                      Generate PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && orders.length === 0 && <div>No orders found.</div>}
      </div>
    </div>
  );
}
