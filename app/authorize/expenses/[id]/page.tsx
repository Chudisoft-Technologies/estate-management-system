"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import axios from "axios";

const EditExpenseForm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams(); // Gets the id from the URL parameters

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(false);
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [apartmentId, setApartmentId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch("/api/v1/buildings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setBuildings(data.data);
      } catch {
        new Toastify({
          text: "Failed to load buildings",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    const fetchApartments = async () => {
      try {
        const res = await fetch("/api/v1/apartments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setApartments(data.data);
      } catch {
        new Toastify({
          text: "Failed to load apartments",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    const fetchExpenseDetails = async () => {
      if (id) {
        try {
          const response = await axios.get(`/api/v1/expenses/${id}`);
          const data = response.data;
          setName(data.name);
          setAmount(data.amount.toString());
          setDescription(data.description);
          setCategory(data.category);
          setActive(data.active || false);
          setBuildingId(data.buildingId || null);
          setApartmentId(data.apartmentId || null);
        } catch {
          new Toastify({
            text: "Failed to load expense details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBuildings();
    fetchApartments();
    fetchExpenseDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      name,
      amount: parseFloat(amount),
      description,
      category,
      active,
      buildingId,
      apartmentId,
    };

    try {
      await axios.put(`/api/v1/expenses/${id}`, expenseData);
      new Toastify({
        text: "Expense updated successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();
      router.push("/authorize/expenses");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update expense");
      new Toastify({
        text: error.response?.data?.error || "Failed to update expense",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Edit Expense</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="building" className="block text-gray-700">
              Building
            </label>
            <select
              id="building"
              value={buildingId || ""}
              onChange={(e) => {
                setBuildingId(parseInt(e.target.value) || null);
                setApartmentId(null); // Clear apartment selection if building is chosen
              }}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select a building</option>
              {buildings.length > 0 ? (
                buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))
              ) : (
                <option value="">No buildings available</option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="apartment" className="block text-gray-700">
              Apartment
            </label>
            <select
              id="apartment"
              value={apartmentId || ""}
              onChange={(e) => setApartmentId(parseInt(e.target.value) || null)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select an apartment</option>
              {apartments.length > 0 ? (
                apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name}
                  </option>
                ))
              ) : (
                <option value="">No apartments available</option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="active" className="inline-flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Active</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseForm;
