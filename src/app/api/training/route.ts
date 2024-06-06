import { NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import { ProductData } from "@/app/lib/types";

export async function POST(request: Request) {
  const data: ProductData[] = await request.json();

  // Preparar los datos
  const { features, labels } = prepareData(data);

  // Definir y entrenar el modelo
  const model = await trainModel(features, labels);

  // Guardar el modelo
  await model.save(`file://./model`);

  return NextResponse.json({ success: true });
}

function prepareData(data: ProductData[]): {
  features: tf.Tensor2D;
  labels: tf.Tensor1D;
} {
  // Obtener listas únicas de nombres de productos y proveedores
  const productNames = Array.from(
    new Set(data.map((item) => item.product_name))
  );
  const vendorNames = Array.from(new Set(data.map((item) => item.vendor_name)));

  // Crear un mapa de índices para los nombres de productos y proveedores
  const productIndices = new Map(
    productNames.map((name, index) => [name, index])
  );
  const vendorIndices = new Map(
    vendorNames.map((name, index) => [name, index])
  );

  // Crear matrices de características y etiquetas
  const featuresArray: number[][] = [];
  const labelsArray: number[] = [];

  // Convertir datos a matrices de características y etiquetas
  data.forEach((item) => {
    const productNameIndex = productIndices.get(item.product_name);
    const vendorNameIndex = vendorIndices.get(item.vendor_name);

    if (productNameIndex !== undefined && vendorNameIndex !== undefined) {
      featuresArray.push([productNameIndex]);
      labelsArray.push(vendorNameIndex);
    }
  });

  // Convertir matrices a tensores y asegurar que sean float32
  const features = tf.tensor2d(
    featuresArray,
    [featuresArray.length, 1],
    "float32"
  );
  const labels = tf.tensor1d(labelsArray, "int32");

  return { features, labels };
}

async function trainModel(
  features: tf.Tensor2D,
  labels: tf.Tensor1D
): Promise<tf.Sequential> {
  const model = tf.sequential();

  // Definir la arquitectura del modelo
  model.add(
    tf.layers.dense({ units: 10, inputShape: [1], activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 1, activation: "softmax" }));

  // Compilar el modelo
  model.compile({
    loss: "sparseCategoricalCrossentropy",
    optimizer: "adam",
    metrics: ["accuracy"],
  });

  // Entrenar el modelo
  await model.fit(features, labels, { epochs: 10 });

  return model;
}
