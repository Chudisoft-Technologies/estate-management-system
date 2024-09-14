"use client";

import React from "react";
import { Building } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface BuildingCardProps {
  building: Building;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void; // Add onDelete to props
}

const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  onEdit,
  onDelete,
}) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/buildings?id=${building.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log(`Building ${building.id} deleted successfully`);
        onDelete(building.id); // Call onDelete prop on successful deletion
      } else {
        console.error(`Failed to delete building: ${response.statusText}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to delete building:", error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-600" />
        {building.name}
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
