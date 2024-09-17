"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import React from "react";

interface ApartmentFormProps {
  apartmentId?: number; // Optional ID for editing
}

const ApartmentForm: React.FC<ApartmentFormProps> = ({ apartmentId }) => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState(0);
  const [costBy, setCostBy] = useState("");
  const [address, setAddress] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState(0); // State for number of rooms
  const [numberOfPalours, setNumberOfPalours] = useState(0); // State for number of palours
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]); // Store fetched buildings
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false); // New state for client-side checks
  const [token, setToken] = useState<string | null>(null); // Store the token in local state

  const router = useRouter();

  useEffect(() => {
    // Ensure client-side code runs only in the browser
    setIsClient(true);

    // Get token from localStorage only on the client side
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Fetch buildings directly from API
    fetch("/api/v1/buildings", {
      headers: {
        Authorization: `Bearer ${storedToken}`, // Include token in the Authorization header
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBuildings(data.data); // Store buildings in state
      })
      .catch(() => {
        setError("Failed to load buildings");
        new Toastify({
          text: "Failed to load buildings",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      });

    if (apartmentId) {
      // Fetch apartment details for editing
      fetch(`/api/v1/apartments/${apartmentId}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`, // Include token in headers
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const apartment = data.data; // Adjust to handle data.data
          setName(apartment.name);
          setCost(apartment.cost);
          setCostBy(apartment.costBy);
          setAddress(apartment.address);
          setBuildingId(apartment.buildingId);
          setNumberOfRooms(apartment.numberOfRooms); // Set number of rooms for editing
          setNumberOfPalours(apartment.numberOfPalours); // Set number of palours for editing
        })
        .catch(() => {
          setError("Failed to load apartment details");
          new Toastify({
            text: "Failed to load apartment details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        });
    }
  }, [apartmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      cost <= 0 ||
      !costBy ||
      !address ||
      buildingId === null ||
      numberOfRooms <= 0 || // Validate number of rooms
      numberOfPalours <= 0 // Validate number of palours
    ) {
      setError("Please fill in all fields");

      // Show error notification
      new Toastify({
        text: "Please fill in all fields",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();

      return;
    }

    const apartmentData = {
      name,
      cost,
      costBy,
      address,
      buildingId,
      numberOfRooms,
      numberOfPalours, // Include number of palours
    };

    const url = apartmentId
      ? `/api/v1/apartments/${apartmentId}`
      : "/api/v1/apartments";
    const method = apartmentId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from state
        },
        body: JSON.stringify(apartmentData),
      });

      if (res.ok) {
        // Show success notification
        new Toastify({
          text: apartmentId
            ? "Apartment updated successfully!"
            : "Apartment added successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();

        router.push("/authorize/apartments");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save apartment");

        // Show error notification
        new Toastify({
          text: data.error || "Failed to save apartment",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch (error) {
      setError("An unexpected error occurred");

      // Show error notification
      new Toastify({
        text: "An unexpected error occurred",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  if (!isClient) {
    return null; // Avoid rendering until client-side code can be executed
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          {apartmentId ? "Edit Apartment" : "Add Apartment"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Apartment Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cost" className="block text-gray-700">
              Cost
            </label>
            <input
              type="number"
              id="cost"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="costBy" className="block text-gray-700">
              Cost By
            </label>
            <input
              type="text"
              id="costBy"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={costBy}
              onChange={(e) => setCostBy(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="numberOfRooms" className="block text-gray-700">
              Number of Rooms
            </label>
            <input
              type="number"
              id="numberOfRooms"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="numberOfPalours" className="block text-gray-700">
              Number of Palours
            </label>
            <input
              type="number"
              id="numberOfPalours"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={numberOfPalours}
              onChange={(e) => setNumberOfPalours(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="building" className="block text-gray-700">
              Building
            </label>
            <select
              id="building"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={buildingId ?? ""}
              onChange={(e) => setBuildingId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                Select Building
              </option>
              {Array.isArray(buildings) && buildings.length > 0 ? (
                buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No buildings available
                </option>
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {apartmentId ? "Update Apartment" : "Add Apartment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApartmentForm;
