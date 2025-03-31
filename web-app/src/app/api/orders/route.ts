import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

// Připojení k PocketBase (změň URL podle svého serveru)
const pb = new PocketBase(process.env.PB_URL);

// Autentizace s PocketBase pomocí env proměnných
async function authenticatePocketBase() {
  try {
    // Uživatelská autentizace
    await pb
      .collection("users")
      .authWithPassword(
        process.env.PB_ADMIN_EMAIL || "",
        process.env.PB_ADMIN_PASS || ""
      );
  } catch (error) {
    console.error("Chyba při autentizaci s PocketBase:", error);
    throw new Error("Autentizace s PocketBase selhala");
  }
}

export async function GET() {
  try {
    // Autentizace
    await authenticatePocketBase();

    // Načtení dat z tabulky "orders"
    const orders = await pb.collection("orders").getFullList({
      sort: "-id", // Seřazení podle data vytvoření (nejnovější první)
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Chyba při načítání dat z PocketBase:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst data z PocketBase" },
      { status: 500 }
    );
  }
}
