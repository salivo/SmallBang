"use client";
import { useEffect, useState } from "react";
import {
  createOrder,
  getCouriers,
  deleteOrder,
  getOrders,
  updateOrder, // Import updateOrder function
} from "@/lib/order_actions"; // Import deleteOrder function

// Define types for couriers and form data
interface Courier {
  id: string;
  name: string;
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
  const [orders, setOrders] = useState<Order[]>([]); // State for orders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // State for delete modal
  const [isEditOpen, setIsEditOpen] = useState(false); // State for edit modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for the order being edited
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

    const fetchOrders = async () => {
      try {
        const ordersData = await getOrders(); // Assume getOrders fetches the list of orders
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchCouriers();
    fetchOrders();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (selectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, [name]: value } : null));
    }
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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      // Map the courier field back to courier_id for the database
      const updatedOrder = {
        ...selectedOrder,
        courier_id: selectedOrder.courier, // Map courier to courier_id for the backend
      };

      await updateOrder(selectedOrder.id, updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...selectedOrder, courier: selectedOrder.courier }
            : order
        )
      );
      setMessage("Order updated successfully!");
      setIsEditOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error updating order: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId); // Assume deleteOrder deletes the order by ID
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setMessage("Order deleted successfully!");
      setIsDeleteOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error deleting order: " + errorMessage);
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const toggleDeleteModal = () => {
    setIsDeleteOpen(!isDeleteOpen);
  };

  const toggleEditModal = (order?: Order) => {
    if (order) {
      // Map the courier_id from the database to the courier field
      const assignedCourier = couriers.find(
        (courier) => courier.id === order.courier_id
      );
      setSelectedOrder({
        ...order,
        courier: assignedCourier ? assignedCourier.id : "", // Use the courier ID if found
      });
    }
    setIsEditOpen(!isEditOpen);
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

      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
        onClick={toggleDeleteModal}
      >
        Delete Order
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
                  htmlFor="Customer_name"
                >
                  Customer Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_name"
                  name="Customer_name"
                  type="text"
                  value={formData.Customer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_tel"
                >
                  Customer Phone
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_tel"
                  name="Customer_tel"
                  type="text"
                  value={formData.Customer_tel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_email"
                >
                  Customer Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_email"
                  name="Customer_email"
                  type="email"
                  value={formData.Customer_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_address"
                >
                  Customer Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_address"
                  name="Customer_address"
                  type="text"
                  value={formData.Customer_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Sender_address"
                >
                  Sender Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Sender_address"
                  name="Sender_address"
                  type="text"
                  value={formData.Sender_address}
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

      {isDeleteOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete Order</h2>
              <button
                onClick={toggleDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <ul className="space-y-2">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>{order.Customer_name}</span>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleDelete(order.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isEditOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Order</h2>
              <button
                onClick={() => toggleEditModal()}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_name"
                >
                  Customer Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_name"
                  name="Customer_name"
                  type="text"
                  value={selectedOrder.Customer_name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_tel"
                >
                  Customer Phone
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_tel"
                  name="Customer_tel"
                  type="text"
                  value={selectedOrder.Customer_tel}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_email"
                >
                  Customer Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_email"
                  name="Customer_email"
                  type="email"
                  value={selectedOrder.Customer_email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Customer_address"
                >
                  Customer Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Customer_address"
                  name="Customer_address"
                  type="text"
                  value={selectedOrder.Customer_address}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="Sender_address"
                >
                  Sender Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="Sender_address"
                  name="Sender_address"
                  type="text"
                  value={selectedOrder.Sender_address}
                  onChange={handleEditChange}
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
                  value={selectedOrder.courier} // Automatically select the assigned courier
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select a courier</option>
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
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

      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <span>{order.Customer_name}</span>
            <div>
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                onClick={() => toggleEditModal(order)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                onClick={() => handleDelete(order.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
