import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import React from "react";
import { BookingStatus } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

interface BookingStatusCardProps {
  bookingStatus: BookingStatus;
  onDelete: (id: number) => void;
}

const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  bookingStatus,
  onDelete,
}) => {
  const router = useRouter(); // Initialize useRouter

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/bookingstatus/${bookingStatus.id}`);
      onDelete(bookingStatus.id); // Notify parent component to remove item from UI
      new Toastify({
        text: "Booking status deleted successfully!",
        duration: 3000,
        backgroundColor: "#4CAF50",
        stopOnFocus: true,
      }).showToast();
    } catch (error) {
      new Toastify({
        text: "Failed to delete booking status.",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col my-5">
      <h3 className="text-xl font-semibold mb-2 flex items-center">
        <FontAwesomeIcon icon={faTag} className="mr-2 text-black bg-white" />
      </h3>
      <h3 className="text-black">{bookingStatus.status}</h3>
      <h3 className="text-black">ID: {bookingStatus.id}</h3>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() =>
            router.push(`/authorize/bookingstatus/${bookingStatus.id}`)
          } // Use router.push to navigate
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

export default BookingStatusCard;
