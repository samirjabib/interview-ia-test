// /app/api/nlu/route.ts

import { NextResponse } from "next/server";
import nlp from "compromise";
import { ProductData } from "@/app/lib/types";

export async function POST(request: Request) {
  const data: ProductData[] = await request.json();

  const standardizedData = standardizeEntities(data);

  return NextResponse.json(standardizedData);
}

function standardizeEntities(data: ProductData[]): ProductData[] {
  return data.map((item) => {
    // Estandarizar nombres de proveedores y productos
    const standardizedVendor = standardizeText(item.vendor_name);
    const standardizedProduct = standardizeText(item.product_name);

    return {
      ...item,
      vendor_name: standardizedVendor,
      product_name: standardizedProduct,
    };
  });
}

function standardizeText(text: string): string {
  // Aplicar procesamiento de NLP para estandarizar el texto
  const doc = nlp(text);
  // Aquí podrías agregar reglas de estandarización específicas según tus necesidades

  // Por ejemplo, podrías convertir todo a minúsculas y eliminar caracteres especiales
  const standardizedText = doc.normalize().toLowerCase().out("text");

  return standardizedText;
}
