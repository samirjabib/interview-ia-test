import { NextResponse } from "next/server";
import { cleanData } from "../lib/utils";
import { ProductData } from "../lib/types";

export async function GET() {
  const csv = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7PKHpwrWpim6zR9h4VCsffEO3v-bF0_29t29Xzmynvzy37nkSQiyl6yI6Sm_krVew5npWLI9WZqk0/pub?output=csv",
    {
      next: { revalidate: 60 },
    }
  ).then((res) => res.text());

  const googleSheetData: ProductData[] = csv
    .split("\n")
    .slice(1)
    .map((row) => {
      const [
        product_id,
        product_name,
        product_description,
        vendor_name,
        vendor_email,
      ] = row.split(",");

      return {
        product_id,
        product_name,
        product_description,
        vendor_name,
        vendor_email: vendor_email.trim(), // Remove extra newline characters
      };
    });

  const cleanedData = cleanData(googleSheetData);

  const standardizedData = await fetch("http://localhost:3000/api/nlu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanedData),
  }).then((res) => res.json());

  const trainingModel = await fetch("http://localhost:3000/api/training", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(standardizedData),
  }).then((res) => res.json());

  console.log(trainingModel);

  return NextResponse.json(standardizedData);
}
