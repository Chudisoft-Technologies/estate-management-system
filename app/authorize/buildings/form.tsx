"use client"; // Ensure this line is present at the top

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import axios from "axios";

interface BuildingFormProps {
  buildingId?: number; // Optional ID for editing
}

interface LawFirm {
  id: number;
  name: string;
}

interface User {
  id: string;
  fullName: string;
  image?: string;
}

const BuildingForm: React.FC<BuildingFormProps> = ({ buildingId }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lawFirmId, setLawFirmId] = useState<number | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([]); // Use LawFirm type
  const [users, setUsers] = useState<User[]>([]); // Use User type
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Retrieve token from local storage

      try {
        // Fetch law firms and users
        const lawFirmsResponse = await axios.get<LawFirm[]>("/api/v1/lawfirm", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "", // Add token if available
          },
        });
        const usersResponse = await axios.get<User[]>("/api/v1/users", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "", // Add token if available
          },
        });

        // Log API responses for debugging
        console.log("Law Firms Response:", lawFirmsResponse.data);
        console.log("Users Response:", usersResponse.data);

        // Ensure the response data is an array
        setLawFirms(
          Array.isArray(lawFirmsResponse.data) ? lawFirmsResponse.data : []
        );
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);

        if (buildingId) {
          // Fetch building details for editing
          const buildingResponse = await fetch(
            `/api/v1/buildings/${buildingId}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "", // Add token if available
              },
            }
          );
          const buildingData = await buildingResponse.json();
          setName(buildingData.name);
          setAddress(buildingData.address);
          setLawFirmId(buildingData.lawFirmId);
          setManagerId(buildingData.managerId);
        }
      } catch (error) {
        console.error("Error fetching data:", error); // Log error details
        setError("Failed to load data");
      }
    };

    fetchData();
  }, [buildingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const buildingData = { name, address, lawFirmId, managerId };
    const token = localStorage.getItem("token"); // Retrieve token from local storage

    const url = buildingId
      ? `/api/v1/buildings/${buildingId}`
      : "/api/v1/buildings";
    const method = buildingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "", // Add token if available
        },
        body: JSON.stringify(buildingData),
      });

      if (res.ok) {
        router.push("/buildings");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save building");
      }
    } catch (error) {
      console.error("Error saving building:", error); // Log error details
      setError("An error occurred while saving the building.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          {buildingId ? "Edit Building" : "Add Building"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="name" className="block text-gray-700">
              Building Name
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faBuilding}
                className="absolute ml-2 text-gray-400"
              />
              <input
                type="text"
                id="name"
                className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4 relative">
            <label htmlFor="address" className="block text-gray-700">
              Address
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="absolute ml-2 text-gray-400"
              />
              <input
                type="text"
                id="address"
                className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="lawFirm" className="block text-gray-700">
              Law Firm
            </label>
            <select
              id="lawFirm"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={lawFirmId ?? ""}
              onChange={(e) => setLawFirmId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                Select Law Firm
              </option>
              {Array.isArray(lawFirms) && lawFirms.length > 0 ? (
                lawFirms.map((firm) => (
                  <option key={firm.id} value={firm.id}>
                    {firm.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No Law Firms Available
                </option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="manager" className="block text-gray-700">
              Manager
            </label>
            <div className="carousel flex space-x-2 overflow-x-scroll p-2 border border-gray-300 rounded">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setManagerId(user.id)}
                    className={`cursor-pointer p-2 rounded ${
                      managerId === user.id ? "bg-blue-200" : "bg-white"
                    }`}
                  >
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.fullName || "Manager"}
                      width={64} // Example width
                      height={64} // Example height
                      className="rounded-full"
                    />
                    <p className="text-center">{user.fullName}</p>
                  </div>
                ))
              ) : (
                <p>No managers available</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {buildingId ? "Update Building" : "Add Building"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuildingForm;
