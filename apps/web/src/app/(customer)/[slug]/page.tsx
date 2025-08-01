"use client";
import { useParams } from 'next/navigation';
import React from 'react'

const RestaurantPage = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div>
      hey {slug}
    </div>
  )
}

export default RestaurantPage;
