"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import LawFirmCard from "./LawFirmCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LawFirm } from "@prisma/client";

const LawFirmList: React.FC = () => {
  const [lawfirms, setLawfirms] = useState<LawFirm[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token); // Debug token
        const response = await axios.get("/api/v1/lawfirm", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched data:", response.data); // Debug fetched data

        // Ensure response.data.data is an array of law firms
        if (Array.isArray(response.data.data)) {
          setLawfirms(response.data.data);
        } else {
          console.error("Unexpected data format:", response.data);
          setLawfirms([]);
        }
      } catch (error) {
        console.error("Error fetching law firms:", error);
        setLawfirms([]);
      }
    };

    fetchLawFirms();
    setIsClient(true);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof LawFirm) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
  };

  const filteredLawFirms = lawfirms
    .filter((firm) =>
      firm.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLawFirms = filteredLawFirms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Name", "Address", "Phone", "Email"]],
      body: lawfirms.map((firm) => [
        firm.name,
        firm.address,
        firm.phone,
        firm.email,
      ]),
    });
    doc.save("lawfirms.pdf");
  };

  const exportToExcel = () => {
    const csvData = lawfirms.map((firm) => ({
      Name: firm.name,
      Address: firm.address,
      Phone: firm.phone,
      Email: firm.email,
    }));
    const csvBlob = new Blob(
      [csvData.map((row) => Object.values(row).join(",")).join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );
    saveAs(csvBlob, "lawfirms.csv");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded"
        />

        <div className="flex space-x-2">
          {isClient && (
            <CSVLink
              data={lawfirms.map((firm) => ({
                Name: firm.name,
                Address: firm.address,
                Phone: firm.phone,
                Email: firm.email,
              }))}
              filename={"lawfirms.csv"}
              className="btn btn-primary"
            >
              Export to CSV
            </CSVLink>
          )}
          <button onClick={exportToPDF} className="btn btn-primary">
            Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn btn-primary">
            Export to Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentLawFirms.length > 0 ? (
          currentLawFirms.map((firm) => (
            <LawFirmCard key={firm.id} lawFirm={firm} />
          ))
        ) : (
          <p>No law firms found.</p>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredLawFirms.length}
          currentPage={currentPage}
          paginate={(pageNumber) => setCurrentPage(pageNumber)}
        />
      </div>
    </div>
  );
};

export default LawFirmList;
