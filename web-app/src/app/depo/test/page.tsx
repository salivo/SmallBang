"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";

import {
  createOrder,
  getCouriers,
  deleteOrder,
  getOrders,
  updateOrder,
} from "@/lib/order_actions";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
  Printer,
  X,
  Check,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpDown,
  Download,
} from "lucide-react";

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
  courier_id?: string;
  status: string;
  created?: string;
  updated?: string;
}

// Status options
const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function DepoPage() {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    Customer_name: "",
    Customer_address: "",
    Customer_tel: "",
    Customer_email: "",
    Sender_address: "",
    courier: "",
    status: "pending",
  });

  // State for data
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [courierFilter, setCourierFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    Customer_name: true,
    Customer_address: true,
    Customer_tel: true,
    Customer_email: true,
    Sender_address: true,
    courier: true,
    status: true,
    actions: true,
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  // Refs
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders when search term, status filter, or courier filter changes
  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, courierFilter, orders, sortConfig]);

  // Close column menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(event.target as Node)
      ) {
        setIsColumnMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch couriers and orders
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [couriersData, ordersData] = await Promise.all([
        getCouriers(),
        getOrders(""),
      ]);
      setCouriers(couriersData);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setMessage(error instanceof Error ? error.message : "Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search term, status, and courier
  const filterOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.Customer_name.toLowerCase().includes(term) ||
          order.Customer_email.toLowerCase().includes(term) ||
          order.Customer_tel.toLowerCase().includes(term) ||
          order.Customer_address.toLowerCase().includes(term) ||
          order.id.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply courier filter
    if (courierFilter) {
      filtered = filtered.filter((order) => order.courier === courierFilter);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        if (
          a[sortConfig.key as keyof Order] < b[sortConfig.key as keyof Order]
        ) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof Order] > b[sortConfig.key as keyof Order]
        ) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(filtered);
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (selectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  // Handle create order form submission
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
      setIsCreateModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error creating order: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit order form submission
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      // Map the courier field back to courier_id for the database
      const updatedOrder = {
        ...selectedOrder,
        courier_id: selectedOrder.courier,
      };

      await updateOrder(selectedOrder.id, updatedOrder);
      setMessage("Order updated successfully!");
      setIsEditModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error updating order: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle order deletion
  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await deleteOrder(orderId);
      setMessage("Order deleted successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error deleting order: " + errorMessage);
    }
  };

  // Handle print order
  const handlePrint = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const courierName =
      couriers.find((c) => c.id === order.courier)?.name || "Unknown";

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .row { display: flex; margin-bottom: 5px; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            @media print {
              .no-print { display: none; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="no-print" style="text-align: right; margin-bottom: 20px;">
              <button onclick="window.print()">Print</button>
            </div>
            
            <h1>Order #${order.id}</h1>
            
            <div class="section">
              <h2>Customer Information</h2>
              <div class="row">
                <div class="label">Name:</div>
                <div class="value">${order.Customer_name}</div>
              </div>
              <div class="row">
                <div class="label">Email:</div>
                <div class="value">${order.Customer_email}</div>
              </div>
              <div class="row">
                <div class="label">Phone:</div>
                <div class="value">${order.Customer_tel}</div>
              </div>
              <div class="row">
                <div class="label">Address:</div>
                <div class="value">${order.Customer_address}</div>
              </div>
            </div>
            
            <div class="section">
              <h2>Shipping Information</h2>
              <div class="row">
                <div class="label">Sender Address:</div>
                <div class="value">${order.Sender_address}</div>
              </div>
              <div class="row">
                <div class="label">Courier:</div>
                <div class="value">${courierName}</div>
              </div>
              <div class="row">
                <div class="label">Status:</div>
                <div class="value">${order.status}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev],
    }));
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });
  };

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Customer Address",
      "Customer Phone",
      "Customer Email",
      "Sender Address",
      "Courier",
      "Status",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredOrders.map((order) => {
        const courierName =
          couriers.find((c) => c.id === order.courier)?.name || "";
        return [
          order.id,
          `"${order.Customer_name.replace(/"/g, '""')}"`,
          `"${order.Customer_address.replace(/"/g, '""')}"`,
          `"${order.Customer_tel.replace(/"/g, '""')}"`,
          `"${order.Customer_email.replace(/"/g, '""')}"`,
          `"${order.Sender_address.replace(/"/g, '""')}"`,
          `"${courierName.replace(/"/g, '""')}"`,
          order.status,
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  // Get courier name by ID
  const getCourierName = (courierId: string) => {
    const courier = couriers.find((c) => c.id === courierId);
    return courier ? courier.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Depot Management
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
              <button
                onClick={fetchData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("couriers")}
              className={`${
                activeTab === "couriers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Couriers
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`${
                activeTab === "status"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Status Overview
            </button>
          </nav>
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-50 text-red-800"
                : "bg-green-50 text-green-800"
            }`}
          >
            {message}
            <button
              onClick={() => setMessage("")}
              className="float-right"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === "orders" && (
          <>
            {/* Filters and search */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="flex space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={courierFilter}
                    onChange={(e) => setCourierFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Couriers</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 w-full md:w-auto justify-end">
                <div className="relative" ref={columnMenuRef}>
                  <button
                    onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Columns
                  </button>

                  {isColumnMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        {Object.entries(visibleColumns).map(
                          ([column, isVisible]) =>
                            column !== "actions" && (
                              <button
                                key={column}
                                onClick={() => toggleColumnVisibility(column)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                role="menuitem"
                              >
                                {isVisible ? (
                                  <Eye className="h-4 w-4 mr-2 text-indigo-500" />
                                ) : (
                                  <EyeOff className="h-4 w-4 mr-2 text-gray-400" />
                                )}
                                {column === "id"
                                  ? "ID"
                                  : column
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Orders table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No orders found. Try adjusting your filters or create a new
                  order.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <span className="sr-only">Expand</span>
                        </th>
                        {visibleColumns.id && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("id")}
                          >
                            <div className="flex items-center">
                              ID
                              <ArrowUpDown className="h-4 w-4 ml-1" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.Customer_name && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("Customer_name")}
                          >
                            <div className="flex items-center">
                              Customer
                              <ArrowUpDown className="h-4 w-4 ml-1" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.Customer_tel && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Phone
                          </th>
                        )}
                        {visibleColumns.Customer_email && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                        )}
                        {visibleColumns.Customer_address && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Customer Address
                          </th>
                        )}
                        {visibleColumns.Sender_address && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Sender Address
                          </th>
                        )}
                        {visibleColumns.courier && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("courier")}
                          >
                            <div className="flex items-center">
                              Courier
                              <ArrowUpDown className="h-4 w-4 ml-1" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.status && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center">
                              Status
                              <ArrowUpDown className="h-4 w-4 ml-1" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.actions && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr
                            className={
                              expandedOrderId === order.id
                                ? "bg-indigo-50"
                                : "hover:bg-gray-50"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </td>
                            {visibleColumns.id && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.id}
                              </td>
                            )}
                            {visibleColumns.Customer_name && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.Customer_name}
                              </td>
                            )}
                            {visibleColumns.Customer_tel && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.Customer_tel}
                              </td>
                            )}
                            {visibleColumns.Customer_email && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.Customer_email}
                              </td>
                            )}
                            {visibleColumns.Customer_address && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.Customer_address}
                              </td>
                            )}
                            {visibleColumns.Sender_address && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.Sender_address}
                              </td>
                            )}
                            {visibleColumns.courier && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getCourierName(order.courier)}
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                    order.status || ""
                                  )}`}
                                >
                                  {order.status
                                    ? order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)
                                    : "Unknown"}
                                </span>
                              </td>
                            )}
                            {visibleColumns.actions && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => toggleOrderExpansion(order.id)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  {expandedOrderId === order.id
                                    ? "Hide"
                                    : "View"}
                                </button>
                              </td>
                            )}
                          </tr>

                          {/* Expanded row */}
                          {expandedOrderId === order.id && (
                            <tr>
                              <td
                                colSpan={
                                  Object.values(visibleColumns).filter(Boolean)
                                    .length + 1
                                }
                                className="px-6 py-4 bg-gray-50"
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                  <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                                    Order Details
                                  </h3>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setIsEditModalOpen(true);
                                      }}
                                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handlePrint(order)}
                                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <Printer className="h-4 w-4 mr-2" />
                                      Print
                                    </button>
                                    <button
                                      onClick={() => handleDelete(order.id)}
                                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Customer Information
                                    </h4>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Name
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {order.Customer_name}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Phone
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {order.Customer_tel}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Email
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {order.Customer_email}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Address
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {order.Customer_address}
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>

                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Shipping Information
                                    </h4>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                                      <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Sender Address
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {order.Sender_address}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Courier
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          {getCourierName(order.courier)}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">
                                          Status
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                          <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                              order.status || ""
                                            )}`}
                                          >
                                            {order.status
                                              ? order.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                order.status.slice(1)
                                              : "Unknown"}
                                          </span>
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Couriers Tab Content */}
        {activeTab === "couriers" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Couriers
              </h3>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Courier
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {couriers.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No couriers found.
                  </li>
                ) : (
                  couriers.map((courier) => (
                    <li
                      key={courier.id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-800 font-medium">
                              {courier.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {courier.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {courier.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Status Overview Tab Content */}
        {activeTab === "status" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Status Overview
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Summary of orders by status
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
                {STATUS_OPTIONS.map((status) => {
                  const count = orders.filter(
                    (order) => order.status === status.value
                  ).length;
                  return (
                    <div
                      key={status.value}
                      className="bg-white overflow-hidden shadow rounded-lg"
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {status.label}
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900">
                                  {count}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`bg-gray-50 px-4 py-4 sm:px-6 border-t ${status.color.replace(
                          "bg-",
                          "border-"
                        )}`}
                      >
                        <div className="text-sm">
                          <button
                            onClick={() => {
                              setActiveTab("orders");
                              setStatusFilter(status.value);
                            }}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View all
                            <span className="sr-only">, {status.label}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Order
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="Customer_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="Customer_name"
                      id="Customer_name"
                      value={formData.Customer_name}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="Customer_tel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="Customer_tel"
                      id="Customer_tel"
                      value={formData.Customer_tel}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Customer_email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="Customer_email"
                      id="Customer_email"
                      value={formData.Customer_email}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Customer_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="Customer_address"
                      id="Customer_address"
                      rows={3}
                      value={formData.Customer_address}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Sender_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sender Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="Sender_address"
                      id="Sender_address"
                      rows={3}
                      value={formData.Sender_address}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="courier"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Courier
                  </label>
                  <div className="mt-1">
                    <select
                      id="courier"
                      name="courier"
                      value={formData.courier}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a courier</option>
                      {couriers.map((courier) => (
                        <option key={courier.id} value={courier.id}>
                          {courier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Order #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="Customer_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="Customer_name"
                      id="Customer_name"
                      value={selectedOrder.Customer_name}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="Customer_tel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="Customer_tel"
                      id="Customer_tel"
                      value={selectedOrder.Customer_tel}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Customer_email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="Customer_email"
                      id="Customer_email"
                      value={selectedOrder.Customer_email}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Customer_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="Customer_address"
                      id="Customer_address"
                      rows={3}
                      value={selectedOrder.Customer_address}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="Sender_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sender Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="Sender_address"
                      id="Sender_address"
                      rows={3}
                      value={selectedOrder.Sender_address}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="courier"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Courier
                  </label>
                  <div className="mt-1">
                    <select
                      id="courier"
                      name="courier"
                      value={selectedOrder.courier}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a courier</option>
                      {couriers.map((courier) => (
                        <option key={courier.id} value={courier.id}>
                          {courier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={selectedOrder.status}
                      onChange={handleEditChange}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
