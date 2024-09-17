"use client";

import React from "react";
import { Building } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface BuildingCardProps {
  building: Building;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/buildings/${building.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete building: ${response.statusText}`);
      }

      onDelete(building.id);

      new Toastify({
        text: "Building deleted successfully!",
        backgroundColor: "#4CAF50",
        duration: 3000,
      }).showToast();

      router.push("/authorize/buildings");
    } catch (error) {
      new Toastify({
        text: "Failed to delete building.",
        backgroundColor: "#FF4D4D",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-600" />
        <span className="text-black"> {building.name}</span>
      </h3>
      <p className="text-gray-700 flex items-center mb-2">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-600" />
        {building.address}
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onEdit(building.id)}
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

export default BuildingCard;
