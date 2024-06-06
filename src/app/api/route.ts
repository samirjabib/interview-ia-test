import { NextResponse } from "next/server";

// types.ts
export interface ProductData {
  product_id: string;
  product_name: string;
  product_description: string;
  vendor_name: string;
  vendor_email: string;
}

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

  console.log(cleanedData, "Cleaned data");

  return NextResponse.json(cleanedData);
}

const cleanData = (data: ProductData[]) => {
  // Remove duplicates based on product_id
  const uniqueData = data.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.product_id === item.product_id)
  );

  // Handle missing values in all fields
  const cleanedData = uniqueData.filter((item) => {
    return (
      item.product_id.trim() !== "" &&
      item.product_name.trim() !== "" &&
      item.product_description.trim() !== "" &&
      item.vendor_name.trim() !== "" &&
      item.vendor_email.trim() !== ""
    );
  });

  return cleanedData;
};
