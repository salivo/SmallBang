"use client";
import { useEffect, useState } from "react";
import { createOrder, getCouriers } from "@/lib/order_actions";

// Define types for couriers and form data
interface Courier {
  id: string;
  name: string;
}

interface FormData {
  customer_name: string;
  customer_address: string;
  customer_tel: string;
  customer_email: string;
  sender_address: string;
  courier: string;
  status: string;
}

export default function DepoPage() {
  const [formData, setFormData] = useState<FormData>({
    customer_name: "",
    customer_address: "",
    customer_tel: "",
    customer_email: "",
    sender_address: "",
    courier: "",
    status: "pending",
  });
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCouriers = async () => {
      setIsLoading(true);
      try {
        const couriersData = await getCouriers();
        console.log("Fetched couriers:", couriersData); // Log all couriers to the console
        setCouriers(couriersData); // couriersData is already in the correct format
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
        customer_name: "",
        customer_address: "",
        customer_tel: "",
        customer_email: "",
        sender_address: "",
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

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Depo Management</h1>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={toggleModal}
      >
        Create New Order
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Order</h2>
              <button
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="customer_name"
                >
                  Customer Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="customer_tel"
                >
                  Customer Phone
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="customer_tel"
                  name="customer_tel"
                  type="text"
                  value={formData.customer_tel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="customer_email"
                >
                  Customer Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="customer_address"
                >
                  Customer Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="customer_address"
                  name="customer_address"
                  type="text"
                  value={formData.customer_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="sender_address"
                >
                  Sender Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="sender_address"
                  name="sender_address"
                  type="text"
                  value={formData.sender_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="courier"
                >
                  Select Courier
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="courier"
                  name="courier"
                  value={formData.courier}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                >
                  <option value="">
                    {isLoading ? "Loading couriers..." : "Select a courier"}
                  </option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Order"}
                </button>
              </div>

              {message && (
                <p
                  className={
                    message.includes("Error")
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
