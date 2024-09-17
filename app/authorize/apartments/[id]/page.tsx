"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import axios from "axios";

const EditApartmentList: React.FC = () => {
  const router = useRouter();
  const { id } = useParams(); // Gets the id from the URL parameters, if any

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [costBy, setCostBy] = useState("");
  const [address, setAddress] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [numberOfPalours, setNumberOfPalours] = useState("");
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch("/api/v1/buildings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setBuildings(data.data);
      } catch {
        new Toastify({
          text: "Failed to load buildings",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    const fetchApartmentDetails = async () => {
      if (id) {
        try {
          const response = await axios.get(`/api/v1/apartments/${id}`);
          const data = response.data;
          setName(data.name);
          setCost(data.cost.toString());
          setCostBy(data.costBy);
          setAddress(data.address);
          setNumberOfRooms(data.numberOfRooms.toString());
          setNumberOfPalours(data.numberOfPalours.toString());
          setBuildingId(data.buildingId || null);
        } catch {
          new Toastify({
            text: "Failed to load apartment details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBuildings();
    fetchApartmentDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apartmentData = {
      name,
      cost: parseFloat(cost),
      costBy,
      address,
      numberOfRooms: parseInt(numberOfRooms, 10),
      numberOfPalours: parseInt(numberOfPalours, 10),
      buildingId,
    };

    try {
      await axios.put(`/api/v1/apartments/${id}`, apartmentData);
      new Toastify({
        text: "Apartment updated successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();
      router.push("/authorize/apartments");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update apartment");
      new Toastify({
        text: error.response?.data?.error || "Failed to update apartment",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Edit Apartment</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Apartment Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
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
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
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
              value={costBy}
              onChange={(e) => setCostBy(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
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
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
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
              value={numberOfPalours}
              onChange={(e) => setNumberOfPalours(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="building" className="block text-gray-700">
              Building
            </label>
            <select
              id="building"
              value={buildingId || ""}
              onChange={(e) => setBuildingId(parseInt(e.target.value) || null)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select a building</option>
              {buildings.length > 0 ? (
                buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))
              ) : (
                <option value="">No buildings available</option>
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditApartmentList;
