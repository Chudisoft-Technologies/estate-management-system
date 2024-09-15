"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ExpenseCard from "./ExpenseCard"; // Import the ExpenseCard component
import { Expense } from "@prisma/client";
import Toastify from "toastify-js"; // Import Toastify
import "toastify-js/src/toastify.css"; // Import Toastify CSS

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/v1/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(response.data.data); // Set expenses data
      } catch (error) {
        new Toastify({
          text: "Failed to load expenses",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleEdit = (id: number) => {
    // Handle editing logic
    console.log(`Edit expense with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    new Toastify({
      text: "Expense deleted successfully",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    }).showToast();
  };

  if (loading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expense List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-gray-500">No expenses found</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
