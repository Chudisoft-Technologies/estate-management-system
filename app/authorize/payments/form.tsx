"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { Rent } from "@prisma/client";

interface PaymentFormProps {
  paymentId?: string; // Changed to string
}

const PaymentForm: React.FC<PaymentFormProps> = () => {
  const [amountPaid, setAmountPaid] = useState("");
  const [accountPaidTo, setAccountPaidTo] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentId, setPaymentId] = useState(""); // Ensure this is a string
  const [rent, setRent] = useState({} as Rent);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantName, setSelectedTenantName] = useState<string>("");
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [token, setToken] = useState<string>("");
  const [rents, setRents] = useState<Rent[]>([]); // State for rents
  const [selectedRentId, setSelectedRentId] = useState<number | "">(""); // State for selected rent ID

  const router = useRouter();
  const searchParams = useSearchParams();
  const rentId = parseInt(searchParams.get("rentId") || "", 10);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    // Fetch rents to populate the dropdown
    fetch("/api/v1/rents")
      .then((res) => res.json())
      .then((data) => setRents(data.data))
      .catch(() => {
        setError("Failed to load rents");
        new Toastify({
          text: "Failed to load rents",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      });

    if (rentId) {
      fetch(`/api/v1/rents/${rentId}`)
        .then((res) => res.json())
        .then((data) => setRent(data))
        .catch(() => {
          setError("Failed to load rent details");
          new Toastify({
            text: "Failed to load rent details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        });
    }

    fetch("/api/v1/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredTenants = data.data.filter(
          (user: any) => user.role === "TENANT"
        );
        setTenants(filteredTenants);
      })
      .catch(() => {
        setError("Failed to load tenants");
        new Toastify({
          text: "Failed to load tenants",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      });
  }, [rentId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert paymentDate to ISO-8601 format if not already
    const isoDate = new Date(paymentDate).toISOString();

    const paymentData = {
      paymentId, // Send as a string
      comment,
      amountPaid: parseFloat(amountPaid), // Convert amountPaid to float
      accountPaidTo,
      paymentDate: isoDate, // Use ISO-8601 format
      rentId: selectedRentId, // Include selectedRentId
      tenantId: rent?.tenantId,
      // tenant: selectedTenantName,
    };

    try {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (res.ok) {
        new Toastify({
          text: "Payment saved successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
        router.push("/authorize/payments");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save payment");
        new Toastify({
          text: data.error || "Failed to save payment",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch {
      setError("An error occurred while saving the payment");
      new Toastify({
        text: "An error occurred while saving the payment",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Payment Form</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="paymentId" className="block text-gray-700">
              Payment ID
            </label>
            <input
              type="text" // Changed to text to handle string input
              id="paymentId"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="rent" className="block text-gray-700">
              Rent
            </label>
            <select
              id="rent"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={selectedRentId || ""}
              onChange={(e) => setSelectedRentId(Number(e.target.value))}
              required
            >
              <option value="">Select a rent</option>
              {rents.length > 0 ? (
                rents.map((rent) => (
                  <option key={rent.id} value={rent.id}>
                    {rent.totalAmount} {/* Assuming rent has a description */}
                  </option>
                ))
              ) : (
                <option value="">No rents available</option>
              )}
            </select>
          </div>

          <div className="mb-4 relative">
            <label htmlFor="amountPaid" className="block text-gray-700">
              Amount Paid
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="absolute ml-2 text-gray-400"
              />
              <input
                type="number" // Handle float input
                step="0.01" // Allow decimal places
                id="amountPaid"
                className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="accountPaidTo" className="block text-gray-700">
              Account Paid To
            </label>
            <input
              type="text"
              id="accountPaidTo"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={accountPaidTo}
              onChange={(e) => setAccountPaidTo(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="paymentDate" className="block text-gray-700">
              Payment Date
            </label>
            <input
              type="date"
              id="paymentDate"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="comment" className="block text-gray-700">
              Comment
            </label>
            <input
              type="text"
              id="comment"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tenant" className="block text-gray-700">
              Tenant
            </label>
            <select
              id="tenant"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={rent?.tenantId || ""}
              onChange={(e) => {
                const tenantId = e.target.value;
                setRent((prevRent) => ({
                  ...prevRent,
                  tenantId: tenantId || "",
                }));

                const selectedTenant = tenants.find(
                  (tenant) => tenant.id === tenantId
                );
                setSelectedTenantName(
                  selectedTenant ? selectedTenant.fullName : ""
                );
              }}
            >
              <option value="">Select a tenant</option>
              {tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.fullName}
                  </option>
                ))
              ) : (
                <option value="">No tenants available</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
