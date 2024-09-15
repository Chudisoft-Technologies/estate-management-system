"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js"; // Import Toastify
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface ExpenseFormProps {
  expenseId?: number; // Optional ID for editing
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseId }) => {
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
    const token = localStorage.getItem("authToken"); // Assuming token is stored in localStorage

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
      description,
      amount,
      category,
      buildingId,
      apartmentId,
    };

    const token = localStorage.getItem("authToken");
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
        router.push("/expenses");
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
            <div className="carousel flex space-x-2 overflow-x-scroll p-2 border border-gray-300 rounded">
              {buildings.length > 0 ? (
                buildings.map((building) => (
                  <div
                    key={building.id}
                    onClick={() => {
                      setBuildingId(building.id);
                      setApartmentId(null); // Clear apartment selection if building is chosen
                    }}
                    className={`cursor-pointer p-2 rounded ${
                      buildingId === building.id ? "bg-blue-200" : "bg-white"
                    }`}
                  >
                    <p className="text-center">{building.name}</p>
                    <p className="text-center text-sm text-gray-500">
                      {building.estate}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No buildings available
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="apartment" className="block text-gray-700">
              Apartment
            </label>
            <div className="carousel flex space-x-2 overflow-x-scroll p-2 border border-gray-300 rounded">
              {apartments.length > 0 ? (
                apartments.map((apartment) => (
                  <div
                    key={apartment.id}
                    onClick={() => {
                      setApartmentId(apartment.id);
                      setBuildingId(null); // Clear building selection if apartment is chosen
                    }}
                    className={`cursor-pointer p-2 rounded ${
                      apartmentId === apartment.id ? "bg-green-200" : "bg-white"
                    }`}
                  >
                    <p className="text-center">{apartment.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No apartments available
                </p>
              )}
            </div>
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
