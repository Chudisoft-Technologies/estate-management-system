"use client";

import React from "react";
import { LawFirm } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS
import { useDispatch } from "react-redux";
import { deleteLawFirm } from "../../store/lawfirmSlice";
import { AppDispatch } from "../../store/index";

interface LawFirmCardProps {
  lawFirm: LawFirm;
}

const LawFirmCard: React.FC<LawFirmCardProps> = ({ lawFirm }) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/lawfirm/${lawFirm.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete law firm: ${response.statusText}`);
      }

      dispatch(deleteLawFirm(lawFirm.id.toString())); // Dispatch action to update state

      new Toastify({
        text: "Law firm deleted successfully!",
        backgroundColor: "#4CAF50",
        duration: 3000,
      }).showToast();

      router.push("/authorize/lawfirms");
    } catch (error) {
      new Toastify({
        text: "Failed to delete law firm.",
        backgroundColor: "#FF4D4D",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2">{lawFirm.name}</h3>
      <p className="text-gray-700 mb-2">
        <strong>Address:</strong> {lawFirm.address}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Phone:</strong> {lawFirm.phone}
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Email:</strong> {lawFirm.email}
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => router.push(`/authorize/lawfirms/${lawFirm.id}`)}
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

export default LawFirmCard;
