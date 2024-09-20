import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const building = await prisma.building.findUnique({
      where: { id },
    });

    if (building) {
      return NextResponse.json(building);
    } else {
      return NextResponse.json(
        { message: "Building not found" },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error retrieving building";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const updatedBuilding = await prisma.building.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBuilding);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error updating building";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// DELETE function to remove a building
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    // Use a transaction to delete related records and the building
    await prisma.$transaction(async (tx) => {
      // Delete all apartments related to the building
      await tx.apartment.deleteMany({ where: { buildingId: id } });

      // Delete all expenses related to the building
      await tx.expense.deleteMany({ where: { buildingId: id } });

      // Add additional deleteMany calls for other related models as needed
      // e.g. await tx.buildingFeature.deleteMany({ where: { buildingId: id } });
      // e.g. await tx.utility.deleteMany({ where: { buildingId: id } });

      // Finally, delete the building itself
      await tx.building.delete({ where: { id } });
    });

    return NextResponse.json({
      message: "Building deleted successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting building";
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { message: "Building not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
