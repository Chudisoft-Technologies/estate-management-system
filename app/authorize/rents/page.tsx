"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRents } from "../../store/rentSlice"; // Ensure you have this slice
import { AppDispatch, RootState } from "../../store";
import RentCard from "./RentCard"; // Ensure you have this component
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Rent } from "@prisma/client";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; // Import Toastify CSS

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const RentList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { rents, status, error } = useSelector(
    (state: RootState) => state.rents
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchRents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/rent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch rents");
        const data = await response.json();
      } catch (err) {
        if (err instanceof Error) {
          new Toastify({
            text: err.message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        } else {
          new Toastify({
            text: "An unknown error occurred",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        }
      }
    };

    fetchRents();
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof (typeof rents)[0]) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order
  };

  const filteredRents = rents
    .filter((rent: Rent) =>
      rent.apartmentId.toString().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.apartmentId - b.apartmentId
        : b.apartmentId - a.apartmentId
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRents = filteredRents.slice(indexOfFirstItem, indexOfLastItem);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Apartment ID", "Amount", "Due Date"]],
      body: rents.map((rent: Rent) => [
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
    const csvData = rents.map((rent: Rent) => ({
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
        {currentRents.map((rent: Rent) => (
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
