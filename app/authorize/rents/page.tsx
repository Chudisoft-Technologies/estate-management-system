"use client";

import React, { useEffect, useState } from "react";
import RentCard from "./RentCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Rent } from "@prisma/client";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import dynamic from "next/dynamic";

const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
  ssr: false,
});

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const RentList: React.FC = () => {
  const [rents, setRents] = useState<Rent[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      setStatus("loading");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/rents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch rents");
        const data = await response.json();

        // Extract the rents from the data object
        const rentsData: Rent[] = data.data;

        // Check if rentsData is an array
        if (!Array.isArray(rentsData)) {
          throw new Error("Unexpected data format");
        }

        setRents(rentsData);
        setStatus("succeeded");
      } catch (err) {
        setStatus("failed");
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        new Toastify({
          text: error ?? "An unknown error occurred",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    fetchData();
  }, [error]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof Rent) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order
  };

  const filteredRents = Array.isArray(rents)
    ? rents
        .filter((rent) =>
          rent.apartmentId.toString().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) =>
          sortOrder === "asc"
            ? a.apartmentId - b.apartmentId
            : b.apartmentId - a.apartmentId
        )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRents = filteredRents.slice(indexOfFirstItem, indexOfLastItem);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Apartment ID", "Amount", "Due Date"]],
      body: rents.map((rent) => [
        rent.apartmentId,
        rent.totalAmount,
        rent.endDate,
      ]),
    });
    doc.save("rents.pdf");
    new Toastify({
      text: "Exported to PDF successfully!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    }).showToast();
  };

  const exportToExcel = () => {
    if (!Array.isArray(rents)) {
      console.error("Rents data is not an array");
      return;
    }

    const csvData = rents.map((rent) => ({
      "Apartment ID": rent.apartmentId,
      Amount: rent.totalAmount,
      "Due Date": rent.endDate,
    }));

    const csvRows = [
      Object.keys(csvData[0]).join(","), // headers
      ...csvData.map((row) => Object.values(row).join(",")), // rows
    ];

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "rents.csv");
    new Toastify({
      text: "Exported to CSV successfully!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    }).showToast();
  };

  const onEdit = (id: number) => {
    // Handle edit logic
  };

  const onDelete = (id: number) => {
    // Handle delete logic
  };

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
            data={rents.map((rent) => ({
              "Apartment ID": rent.apartmentId,
              Amount: rent.totalAmount,
              "Due Date": rent.endDate,
            }))}
            filename={"rents.csv"}
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
        {currentRents.map((rent) => (
          <RentCard
            key={rent.id}
            rent={rent}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredRents.length}
        currentPage={currentPage}
        paginate={(pageNumber: number) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default RentList;
