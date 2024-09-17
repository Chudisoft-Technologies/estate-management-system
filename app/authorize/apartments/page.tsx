"use client";

import React, { useEffect, useState } from "react";
import ApartmentCard from "./ApartmentCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Apartment } from "@prisma/client";
import dynamic from "next/dynamic";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
  ssr: false,
});

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ApartmentList: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchApartments = async () => {
    setStatus("loading");
    const token = localStorage.getItem("token"); // Fetch the token from localStorage
    try {
      const response = await fetch("/api/v1/apartments", {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setApartments(data.data || []); // Update with the correct path to data
      setStatus("succeeded");
    } catch (error: any) {
      setError(error.message || "Failed to fetch apartments");
      setStatus("failed");
      new Toastify({
        text: "Failed to fetch apartments",
        duration: 3000,
        backgroundColor: "#FF4D4D",
        stopOnFocus: true,
      }).showToast();
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof (typeof apartments)[0]) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
  };

  const filteredApartments = (Array.isArray(apartments) ? apartments : [])
    .filter((apartment: Apartment) =>
      apartment.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApartments = filteredApartments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Name", "Address", "Cost", "Cost By", "Building Id"]],
      body: apartments.map((apartment: Apartment) => [
        apartment.name,
        apartment.address,
        apartment.cost,
        apartment.costBy,
        apartment.buildingId,
      ]),
    });
    doc.save("apartments.pdf");
    new Toastify({
      text: "Exported to PDF successfully!",
      duration: 3000,
      backgroundColor: "#4CAF50",
      stopOnFocus: true,
    }).showToast();
  };

  const exportToExcel = () => {
    const csvData = apartments.map((apartment: Apartment) => ({
      Name: apartment.name,
      Address: apartment.address,
      Cost: apartment.cost,
      CostBy: apartment.costBy,
      NumberOfRooms: apartment.numberOfRooms,
      NumberOfPalours: apartment.numberOfPalours,
      BuildingId: apartment.buildingId,
    }));

    const csvRows = [
      Object.keys(csvData[0]).join(","), // headers
      ...csvData.map((row) => Object.values(row).join(",")), // rows
    ];

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "apartments.csv");
    new Toastify({
      text: "Exported to Excel successfully!",
      duration: 3000,
      backgroundColor: "#4CAF50",
      stopOnFocus: true,
    }).showToast();
  };

  const handleDelete = (id: number) => {
    setApartments((prev) => prev.filter((apartment) => apartment.id !== id));
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
          <CSVLink
            data={filteredApartments.map((apartment) => ({
              Name: apartment.name,
              Address: apartment.address,
              Cost: apartment.cost,
              CostBy: apartment.costBy,
              NumberOfRooms: apartment.numberOfRooms,
              NumberOfPalours: apartment.numberOfPalours,
              BuildingId: apartment.buildingId,
            }))}
            filename={"apartments.csv"}
            className="btn btn-primary"
          >
            Export to CSV
          </CSVLink>
          <button onClick={exportToPDF} className="btn btn-primary">
            Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn btn-primary">
            Export to Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentApartments.map((apartment: Apartment) => (
          <ApartmentCard
            key={apartment.id}
            apartment={apartment}
            // onEdit={() => {}}
            onDelete={handleDelete} // Pass handleDelete to ApartmentCard
          />
        ))}
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredApartments.length}
        currentPage={currentPage}
        paginate={(pageNumber: number) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default ApartmentList;
