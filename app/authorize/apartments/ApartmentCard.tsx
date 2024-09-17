"use client";

import React from "react";
import { Apartment } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faMoneyBillWave,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface ApartmentCardProps {
  apartment: Apartment;
  onDelete: (id: number) => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  onDelete,
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/apartments/${apartment.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete apartment: ${response.statusText}`);
      }

      onDelete(apartment.id);

      new Toastify({
        text: "Apartment deleted successfully!",
        backgroundColor: "#4CAF50",
        duration: 3000,
      }).showToast();

      router.push("/authorize/apartments");
    } catch (error) {
      new Toastify({
        text: "Failed to delete apartment.",
        backgroundColor: "#FF4D4D",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-600" />
        {apartment.name}
      </h3>
      <p className="text-gray-700 flex items-center mb-2">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-600" />
        {apartment.address}
      </p>
      <p className="text-gray-700 flex items-center mb-2">
        <FontAwesomeIcon
          icon={faMoneyBillWave}
          className="mr-2 text-gray-600"
        />
        Cost: ${apartment.cost.toFixed(2)}
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => router.push(`/authorize/apartments/${apartment.id}`)}
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

export default ApartmentCard;
