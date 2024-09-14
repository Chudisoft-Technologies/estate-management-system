"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import BuildingCard from "./BuildingCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Building } from "@prisma/client";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const BuildingList: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [status, setStatus] = useState<"loading" | "succeeded" | "failed">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("/api/v1/buildings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBuildings(response.data.data || []);
        setStatus("succeeded");
      } catch (err: any) {
        console.error("Error fetching buildings:", err);
        setError(err.message || "Failed to fetch buildings.");
        setStatus("failed");
        new Toastify({
          text: "Error fetching buildings: " + (err.message || "Unknown error"),
          duration: 3000,
          backgroundColor: "linear-gradient(to right, #FF4B2B, #FF416C)",
        }).showToast();
      }
    };

    fetchBuildings();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof Building) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order could be implemented here
  };

  const filteredBuildings = buildings
    .filter((building) =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBuildings = filteredBuildings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Name", "Address", "Number of Floors"]],
      body: buildings.map((building) => [
        building.name,
        building.address,
        building.numOfFloors,
      ]),
    });
    doc.save("buildings.pdf");
  };

  const exportToCSV = () => {
    const csvData = [
      ["Name", "Address", "Number of Floors"], // Header row
      ...buildings.map((building) => [
        building.name,
        building.address,
        building.numOfFloors,
      ]), // Data rows
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");

    const csvBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "buildings.csv");
  };

  const exportToExcel = () => {
    const csvData = buildings.map((building) => ({
      Name: building.name,
      Address: building.address,
      "Number of Floors": building.numOfFloors,
    }));

    const csvRows = [
      Object.keys(csvData[0]).join(","), // headers
      ...csvData.map((row) => Object.values(row).join(",")), // rows
    ];

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "buildings.csv");
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "failed") {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button onClick={exportToCSV} className="btn btn-primary">
            Export to CSV
          </button>
          <button onClick={exportToPDF} className="btn btn-primary">
            Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn btn-primary">
            Export to Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBuildings.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            onEdit={() => {}}
            onDelete={(id) => {
              setBuildings(buildings.filter((b) => b.id !== id)); // Update the list after deletion
            }}
          />
        ))}
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredBuildings.length}
        currentPage={currentPage}
        paginate={(pageNumber) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default BuildingList;
