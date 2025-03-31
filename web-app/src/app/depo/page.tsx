"use client";
import { useEffect, useState } from "react";
import {
  createOrder,
  getCouriers,
  deleteOrder,
  getOrders,
} from "@/lib/order_actions";

// Define types for couriers, orders, and form data
interface Courier {
  id: string;
  name: string;
}

interface Order {
  id: string;
  Customer_name: string;
  Customer_address: string;
  Customer_tel: string;
  Customer_email: string;
  Sender_address: string;
  courier: string;
  status: string;
}

interface FormData {
  Customer_name: string;
  Customer_address: string;
  Customer_tel: string;
  Customer_email: string;
  Sender_address: string;
  courier: string;
  status: string;
}

export default function DepoPage() {
  const [formData, setFormData] = useState<FormData>({
    Customer_name: "",
    Customer_address: "",
    Customer_tel: "",
    Customer_email: "",
    Sender_address: "",
    courier: "",
    status: "pending",
  });
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCouriers = async () => {
      setIsLoading(true);
      try {
        const couriersData = await getCouriers();
        setCouriers(couriersData);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
        setMessage(
          error instanceof Error ? error.message : "Error loading couriers"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCouriers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await createOrder(formData);
      setMessage("Order created successfully!");
      setFormData({
        Customer_name: "",
        Customer_address: "",
        Customer_tel: "",
        Customer_email: "",
        Sender_address: "",
        courier: "",
        status: "pending",
      });
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error creating order: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setMessage("");
    try {
      await deleteOrder(deleteId);
      setMessage("Order deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteId("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error deleting order: " + errorMessage);
    }
  };

  const fetchOrders = async () => {
    setMessage("");
    setIsLoading(true);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error fetching orders: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Depo Management</h1>

      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleModal}
        >
          Create New Order
        </button>

        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleDeleteModal}
        >
          Delete Order
        </button>

        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={fetchOrders}
        >
          Show All Orders
        </button>
      </div>

      {orders.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Raw Orders Data</h2>
          <pre className="bg-gray-100 p-4 rounded border border-gray-300">
            {JSON.stringify(orders, null, 2)}
          </pre>
        </div>
      )}

      {message && (
        <p
          className={
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
