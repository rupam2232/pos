"use client";
import { useRef } from "react";

const BillReceipt = () => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable area */}
      <div
        id="print-area"
        ref={printAreaRef}
        className="w-[80mm] bg-white text-black p-2 font-mono text-sm"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed pb-2 mb-2">
          <h2 className="font-bold text-lg">TICHSY RESTAURANT</h2>
          <p>Main Street, City</p>
          <p>GSTIN: 29ABCDE1234F1Z5</p>
        </div>

        {/* Bill Info */}
        <div className="flex justify-between text-xs mb-2">
          <span>Bill No: #1023</span>
          <span>22 Aug 2025 - 8:35 PM</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span>Table: 12</span>
          <span>Staff: Ramesh</span>
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-2">
          <thead className="border-b border-dashed">
            <tr className="text-left">
              <th className="w-1/2">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paneer Butter Masala</td>
              <td className="text-right">1</td>
              <td className="text-right">220</td>
              <td className="text-right">220</td>
            </tr>
            <tr>
              <td>Tandoori Roti</td>
              <td className="text-right">4</td>
              <td className="text-right">20</td>
              <td className="text-right">80</td>
            </tr>
            <tr>
              <td>Masala Soda</td>
              <td className="text-right">2</td>
              <td className="text-right">50</td>
              <td className="text-right">100</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-dashed pt-2 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>400.00</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>20.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹420.00</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs border-t border-dashed pt-2">
          <p>Thank you for dining with us!</p>
          <p>Visit Again 🙏</p>
        </div>
      </div>

      {/* Print Button (won't be printed) */}
      <button
        onClick={handlePrint}
        className="mt-4 px-4 py-2 bg-black text-white rounded-md print:hidden"
      >
        Print Bill
      </button>
    </div>
  );
};

export default BillReceipt;
