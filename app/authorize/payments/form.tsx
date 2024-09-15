"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toastify from "toastify-js"; // Import Toastify
import "toastify-js/src/toastify.css"; // Import Toastify CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { Rent } from "@prisma/client";

interface PaymentFormProps {
  paymentId?: number; // Optional ID for editing
}

const PaymentForm: React.FC<PaymentFormProps> = ({ paymentId }) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [accountPaidTo, setAccountPaidTo] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [rent, setRent] = useState({} as Rent);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantName, setSelectedTenantName] = useState<string>(""); // New state for tenant name
  const [error, setError] = useState("");
  const [token, setToken] = useState<string>(""); // State for token

  const router = useRouter();
  const searchParams = useSearchParams();
  const rentId = parseInt(searchParams.get("rentId") || "", 10);

  useEffect(() => {
    // Retrieve token from local storage or any other source
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    // Fetch rent details
    if (rentId) {
      fetch(`/api/v1/rents/${rentId}`)
        .then((res) => res.json())
        .then((data) => {
          setRent(data);
        })
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

    // Fetch tenants
    fetch("/api/v1/users", {
      headers: {
        Authorization: `Bearer ${token}`, // Add token to header
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

  useEffect(() => {
    // Fetch payment details if paymentId is provided
    if (paymentId) {
      fetch(`/api/v1/payments/${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          setAmountPaid(data.amountPaid);
          setAccountPaidTo(data.accountPaidTo);
          setPaymentDate(data.paymentDate);
          // Set tenant details if available
          if (data.tenantId) {
            const tenant = tenants.find((t) => t.id === data.tenantId);
            if (tenant) {
              setSelectedTenantName(tenant.fullName);
            }
          }
        })
        .catch(() => {
          setError("Failed to load payment details");
          new Toastify({
            text: "Failed to load payment details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        });
    }
  }, [paymentId, tenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      amountPaid,
      accountPaidTo,
      paymentDate,
      rentId,
      tenantId: rent?.tenantId,
      tenantName: selectedTenantName, // Add tenantName to the data
    };

    const url = paymentId
      ? `/api/v1/payments/${paymentId}`
      : "/api/v1/payments";
    const method = paymentId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to header
        },
        body: JSON.stringify(paymentData),
      });

      if (res.ok) {
        new Toastify({
          text: paymentId
            ? "Payment updated successfully!"
            : "Payment added successfully!",
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
        <h1 className="text-2xl font-bold mb-4">
          {paymentId ? "Edit Payment" : "Add Payment"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
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
                type="number"
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
                  tenantId: tenantId || "", // Ensure tenantId is a string
                }));

                // Set the tenant name based on selected tenant
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
          {/* Display selected tenant name */}
          {selectedTenantName && (
            <div className="mb-4">
              <label htmlFor="tenantName" className="block text-gray-700">
                Tenant Name
              </label>
              <input
                type="text"
                id="tenantName"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
                value={selectedTenantName}
                readOnly
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {paymentId ? "Update Payment" : "Add Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
