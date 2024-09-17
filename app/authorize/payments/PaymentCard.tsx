"use client";
import React from "react";
import { Payment } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faDollarSign,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

interface PaymentCardProps {
  payment: Payment;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/payments/${payment.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete payment: ${response.statusText}`);
      }

      onDelete(payment.id);

      new Toastify({
        text: "Payment deleted successfully!",
        backgroundColor: "#4CAF50",
        duration: 3000,
      }).showToast();

      router.push("/authorize/payments"); // Adjust the route as necessary
    } catch (error) {
      new Toastify({
        text: "Failed to delete payment.",
        backgroundColor: "#FF4D4D",
        duration: 3000,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-600" />
        <span className="text-black"> {payment.paymentId}</span>
      </h3>
      <p className="text-gray-700 flex items-center mb-2">
        <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-gray-600" />
        <span className="text-black">
          Amount: ${payment.amountPaid.toFixed(2)}{" "}
        </span>
      </p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onEdit(payment.id)}
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

export default PaymentCard;
