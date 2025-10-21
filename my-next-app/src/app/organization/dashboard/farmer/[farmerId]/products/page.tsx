"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import ProductsWithDatabase from '@/components/ProductsWithDatabase';

const FarmerProductsPage = () => {
  const params = useParams();
  let farmerId: string | undefined = undefined;
  if (params?.farmerId) {
    farmerId = Array.isArray(params.farmerId) ? params.farmerId[0] : params.farmerId;
  }

  return (
    <div>
      <h1>Products for Farmer: {farmerId}</h1>
      <ProductsWithDatabase farmerId={farmerId} />
    </div>
  );
};

export default FarmerProductsPage;
