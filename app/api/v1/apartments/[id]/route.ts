import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

async function authenticateRequest(request: NextRequest) {
  const token = await authenticate(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null; // No error
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (apartment) {
      return NextResponse.json(apartment);
    } else {
      return NextResponse.json(
        { message: "Apartment not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving apartment:", error);
    return NextResponse.json(
      { message: "Error retrieving apartment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedApartment);
  } catch (error) {
    console.error("Error updating apartment:", error);
    return NextResponse.json(
      { message: "Error updating apartment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.apartment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    return NextResponse.json(
      { message: "Error deleting apartment" },
      { status: 500 }
    );
  }
}
