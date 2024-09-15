"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

interface RentFormProps {
  rentId?: number; // Optional ID for editing
}

const RentForm: React.FC<RentFormProps> = ({ rentId }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalAmount, setTotalAmount] = useState(0);
  const [apartmentId, setApartmentId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [apartments, setApartments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        return;
      }

      try {
        // Fetch apartments
        const apartmentResponse = await axios.get("/api/v1/apartments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApartments(apartmentResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching apartments:", err);
        setError("Failed to fetch apartments");
      }

      try {
        // Fetch tenants
        const userResponse = await axios.get("/api/v1/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter tenants
        const filteredTenants = userResponse.data.data.filter(
          (user: any) => user.role === "TENANT"
        );
        setTenants(filteredTenants);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError("Failed to fetch users");
      }

      if (rentId) {
        try {
          // Fetch rent details for editing if rentId exists
          const rentResponse = await axios.get(`/api/v1/rents/${rentId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const rentData = rentResponse.data.data;
          setStartDate(new Date(rentData.startDate));
          setEndDate(new Date(rentData.endDate));
          setTotalAmount(rentData.totalAmount);
          setApartmentId(rentData.apartmentId);
          setTenantId(rentData.tenantId);
        } catch (err) {
          console.error("Error fetching rent details:", err);
          setError("Failed to load rent details");
        }
      }

      setIsClient(true);
    };

    fetchData();
  }, [rentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Start Date and End Date are required");
      return;
    }

    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(now.getFullYear() - 2);

    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(now.getFullYear() + 2);

    if (startDate < twoYearsAgo) {
      setError("Start Date cannot be more than 2 years in the past");
      return;
    }

    if (endDate <= startDate) {
      setError("End Date must be after the Start Date");
      return;
    }

    if (endDate > twoYearsFromNow) {
      setError("End Date cannot be more than 2 years in the future");
      return;
    }

    if (!tenantId) {
      setError("Tenant is required");
      return;
    }

    const rentData = {
      startDate,
      endDate,
      totalAmount,
      apartmentId,
      tenantId,
    };

    const token = localStorage.getItem("token");
    const url = rentId ? `/api/v1/rents/${rentId}` : "/api/v1/rents";
    const method = rentId ? "PUT" : "POST";

    try {
      const res = await axios({
        url,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: rentData,
      });

      if (res.status === 200 || 201) {
        router.push("/authorize/rents");
      } else {
        setError(res.data.error || "Failed to save rent");
      }
    } catch (err) {
      console.error("Error saving rent:", err);
      setError("Failed to save rent");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          {rentId ? "Edit Rent" : "Add Rent"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-gray-700">
              Start Date
            </label>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date) => setStartDate(date as Date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              placeholderText="Select start date"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-gray-700">
              End Date
            </label>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => setEndDate(date as Date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={
                new Date(new Date().setFullYear(new Date().getFullYear() + 2))
              }
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              placeholderText="Select end date"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="totalAmount" className="block text-gray-700">
              Total Amount
            </label>
            <input
              type="number"
              id="totalAmount"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="apartment" className="block text-gray-700">
              Apartment
            </label>
            <select
              id="apartment"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={apartmentId || ""}
              onChange={(e) => setApartmentId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                Select an apartment
              </option>
              {Array.isArray(apartments) &&
                apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="tenant" className="block text-gray-700">
              Tenant
            </label>
            <select
              id="tenant"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={tenantId || ""}
              onChange={(e) => setTenantId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a tenant
              </option>
              {Array.isArray(tenants) &&
                tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.fullName} | {tenant.phone}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {rentId ? "Update Rent" : "Add Rent"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RentForm;
