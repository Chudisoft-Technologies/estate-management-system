// components/LawFirmCard.tsx
"use client";

import React from "react";
import { LawFirm } from "@prisma/client";
import { useDispatch } from "react-redux";
import { deleteLawFirm } from "../../store/lawfirmSlice";
import { AppDispatch } from "../../store/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface LawFirmCardProps {
  lawFirm: LawFirm;
}

const LawFirmCard: React.FC<LawFirmCardProps> = ({ lawFirm }) => {
  const dispatch: AppDispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteLawFirm(lawFirm.id.toString()));
  };

  return (
    <div className="p-4 border border-gray-200 rounded shadow-md bg-white">
      <h2 className="text-xl font-bold my-3 text-black">{lawFirm.name}</h2>
      <p className="text-gray-700 mb-1">
        <strong>Address:</strong> {lawFirm.address}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Phone:</strong> {lawFirm.phone}
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Email:</strong> {lawFirm.email}
      </p>
      <div className="flex justify-between mt-4">
        <button className="btn btn-secondary">
          <FontAwesomeIcon icon={faEdit} className="mr-2" />
          Edit
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default LawFirmCard;
