import { ProductData } from "./types";

export const cleanData = (data: ProductData[]) => {
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
