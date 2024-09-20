"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

interface BookingStatusFormProps {
  bookingStatusId?: number; // Optional ID for editing
}

const BookingStatusForm: React.FC<BookingStatusFormProps> = ({
  bookingStatusId,
}) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (bookingStatusId) {
      fetchBookingStatusDetails(bookingStatusId, storedToken);
    }
  }, [bookingStatusId]);

  const fetchBookingStatusDetails = async (
    id: number,
    token: string | null
  ) => {
    try {
      const res = await fetch(`/api/v1/bookingstatus/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch booking status details");
      }

      const data = await res.json();
      setStatus(data.status);
    } catch (err: unknown) {
      const errorMessage =
        (err as Error).message || "Failed to load booking status details";
      setError(errorMessage);
      new Toastify({
        text: errorMessage,
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) {
      setError("Please provide a status");
      new Toastify({
        text: "Please provide a status",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    try {
      const method = bookingStatusId ? "PUT" : "POST";
      const url = bookingStatusId
        ? `/api/v1/bookingstatus/${bookingStatusId}`
        : `/api/v1/bookingstatus`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        new Toastify({
          text: `Booking Status ${
            bookingStatusId ? "updated" : "created"
          } successfully`,
          duration: 3000,
          backgroundColor: "#4CAF50",
          stopOnFocus: true,
        }).showToast();
        router.push("/authorize/bookingstatus");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save booking status");
        new Toastify({
          text: data.error || "Failed to save booking status",
          duration: 3000,
          backgroundColor: "#FF4D4D",
          stopOnFocus: true,
        }).showToast();
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as Error).message || "An unexpected error occurred";
      setError(errorMessage);
      new Toastify({
        text: errorMessage,
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
    }
  };

  if (!isClient) {
    return null; // Prevent rendering until client-side code can run
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          {bookingStatusId ? "Edit Booking Status" : "Add Booking Status"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700">
              Status
            </label>
            <input
              type="text"
              id="status"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {bookingStatusId ? "Update Booking Status" : "Add Booking Status"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingStatusForm;
