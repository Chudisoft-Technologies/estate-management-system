"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

interface EditBookingStatusFormProps {
  bookingStatusId: number; // Required ID for editing
}

const EditBookingStatusForm: React.FC<EditBookingStatusFormProps> = ({
  bookingStatusId,
}) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null); // Store the token in local state
  const [isClient, setIsClient] = useState(false); // New state for client-side checks

  const router = useRouter();

  useEffect(() => {
    console.log("Booking Status ID:", bookingStatusId); // Debugging line

    if (typeof bookingStatusId !== "number" || isNaN(bookingStatusId)) {
      setError("Invalid booking status ID");
      new Toastify({
        text: "Invalid booking status ID",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    // Ensure client-side code runs only in the browser
    setIsClient(true);

    // Get token from localStorage only on the client side
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Fetch booking status details for editing
    fetch(`/api/v1/bookingstatus/${bookingStatusId}`, {
      headers: {
        Authorization: `Bearer ${storedToken}`, // Add token to headers
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch booking status details");
        }
        return res.json();
      })
      .then((data) => {
        setStatus(data.status);
      })
      .catch((err) => {
        setError(err.message || "Failed to load booking status details");
        new Toastify({
          text: err.message || "Failed to load booking status details",
          duration: 3000,
          backgroundColor: "#FF4D4D",
          stopOnFocus: true,
        }).showToast();
      });
  }, [bookingStatusId, token]);

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

    const bookingStatusData = { status };

    try {
      const res = await fetch(`/api/v1/bookingstatus/${bookingStatusId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from state
        },
        body: JSON.stringify(bookingStatusData),
      });

      if (res.ok) {
        new Toastify({
          text: "Booking Status updated successfully",
          duration: 3000,
          backgroundColor: "#4CAF50",
          stopOnFocus: true,
        }).showToast();
        router.push("/authorize/bookingstatus");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update booking status");
        new Toastify({
          text: data.error || "Failed to update booking status",
          duration: 3000,
          backgroundColor: "#FF4D4D",
          stopOnFocus: true,
        }).showToast();
      }
    } catch {
      setError("An unexpected error occurred");
      new Toastify({
        text: "An unexpected error occurred",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
    }
  };

  if (!isClient) {
    return null; // Avoid rendering until client-side code can be executed
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Edit Booking Status</h1>
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
            Update Booking Status
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBookingStatusForm;
