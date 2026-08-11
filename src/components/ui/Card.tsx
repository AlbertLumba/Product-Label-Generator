// src/components/ui/Card.tsx

"use client";

import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};