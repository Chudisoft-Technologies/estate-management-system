"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js"; // Import Toastify
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface ExpenseFormProps {
  expenseId?: number; // Optional ID for editing
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseId }) => {
  const [name, setName] = useState(""); // New state for name
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [apartmentId, setApartmentId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]); // Store buildings
  const [apartments, setApartments] = useState<any[]>([]); // Store apartments
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

    const fetchBuildings = async () => {
      try {
        const res = await fetch("/api/v1/buildings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBuildings(data.data); // Set buildings data
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
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setApartments(data.data); // Set apartments data
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
      if (expenseId) {
        try {
          const res = await fetch(`/api/v1/expenses/${expenseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setName(data.name); // Set name
          setDescription(data.description);
          setAmount(data.amount);
          setCategory(data.category);
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
        }
      }
    };

    fetchBuildings();
    fetchApartments();
    fetchExpenseDetails();
  }, [expenseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      name, // Include name
      description,
      amount,
      category,
      buildingId,
      apartmentId,
    };

    const token = localStorage.getItem("token");
    const url = expenseId
      ? `/api/v1/expenses/${expenseId}`
      : "/api/v1/expenses";
    const method = expenseId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        new Toastify({
          text: expenseId
            ? "Expense updated successfully!"
            : "Expense added successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
        router.push("/authorize/expenses");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save expense");
        new Toastify({
          text: data.error || "Failed to save expense",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch {
      setError("An error occurred while saving the expense");
      new Toastify({
        text: "An error occurred while saving the expense",
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
          {expenseId ? "Edit Expense" : "Add Expense"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
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
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="building" className="block text-gray-700">
              Building
            </label>
            <select
              id="building"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={buildingId || ""}
              onChange={(e) => {
                setBuildingId(parseInt(e.target.value) || null);
                setApartmentId(null); // Clear apartment selection if building is chosen
              }}
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
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={apartmentId || ""}
              onChange={(e) => setApartmentId(parseInt(e.target.value) || null)}
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {expenseId ? "Update Expense" : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
