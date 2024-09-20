import React from "react";
import { Expense } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: number) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/expenses/${expense.id}`);
      onDelete(expense.id); // Notify parent component to remove item from UI
      new Toastify({
        text: "Expense deleted successfully!",
        duration: 3000,
        backgroundColor: "#4CAF50",
        stopOnFocus: true,
      }).showToast();
    } catch (error) {}
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faReceipt} className="mr-2 text-black" />
        <span className="text-yellow-700">{expense.name}</span>
      </h3>
      <p className="text-black">Amount: ${expense.amount.toFixed(2)}</p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => router.push(`/authorize/expenses/${expense.id}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <FontAwesomeIcon icon={faEdit} className="mr-2" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
