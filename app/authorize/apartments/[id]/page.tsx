"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const EditBookingStatusForm = () => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // Extract the pathname from the URL

  // Extract the bookingStatusId from pathname
  const bookingStatusId = pathname?.split("/").pop() as string;

  useEffect(() => {
    if (!bookingStatusId) {
      setError("No booking status ID provided");
      new Toastify({
        text: "No booking status ID provided",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    setIsClient(true);

    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    fetch(`/api/v1/bookingstatus/${bookingStatusId}`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Booking status not found");
          }
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
          Authorization: `Bearer ${token}`,
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
    } catch (err) {
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
    return null;
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
