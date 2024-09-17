"use client";

import React from "react";
import { Rent } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faCalendarAlt,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface RentCardProps {
  rent: Rent;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RentCard: React.FC<RentCardProps> = ({ rent, onEdit, onDelete }) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/rents/${rent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete rent: ${response.statusText}`);
      }

      onDelete(rent.id);

      new Toastify({
        text: "Rent deleted successfully!",
        backgroundColor: "#4CAF50",
        duration: 3000,
      }).showToast();

      router.push("/authorize/rents"); // Adjust the route as necessary
    } catch (error) {
      new Toastify({
        text: "Failed to delete rent.",
        backgroundColor: "#FF4D4D",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-gray-600" />
        <span className="text-black">
          {" "}
          Amount: ${rent.totalAmount.toFixed(2)}{" "}
        </span>
      </h3>
      <p className="text-gray-700 flex items-center mb-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-600" />
        Due Date: {new Date(rent.endDate).toLocaleDateString()}
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onEdit(rent.id)} // Ensure onEdit is passed correctly
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

export default RentCard;
