"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface BookingStatusFormProps {
  bookingStatusId?: number; // Optional ID for editing
}

const BookingStatusForm: React.FC<BookingStatusFormProps> = ({
  bookingStatusId,
}) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false); // New state for client-side checks
  const [token, setToken] = useState<string | null>(null); // Store the token in local state

  const router = useRouter();

  useEffect(() => {
    // Ensure code that depends on the client only runs in the browser
    setIsClient(true);

    // Get token from localStorage only on the client side
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);

    if (bookingStatusId) {
      // Fetch booking status details for editing
      fetch(`/api/v1/bookingStatuses/${bookingStatusId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.status);
        })
        .catch(() => setError("Failed to load booking status details"));
    }
  }, [bookingStatusId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) {
      setError("Please provide a status");
      return;
    }

    const bookingStatusData = { status };

    const url = bookingStatusId
      ? `/api/v1/bookingStatuses/${bookingStatusId}`
      : "/api/v1/bookingStatuses";
    const method = bookingStatusId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from state
        },
        body: JSON.stringify(bookingStatusData),
      });

      if (res.ok) {
        router.push("/bookingStatuses");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save booking status");
      }
    } catch {
      setError("An unexpected error occurred");
    }
  };

  if (!isClient) {
    return null; // Avoid rendering until client-side code can be executed
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
