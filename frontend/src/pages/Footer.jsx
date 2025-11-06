import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-gray-300 text-center py-3 border-t border-gray-700">
      <p className="text-sm">
        © {currentYear} Dhvny. All rights reserved. Built with ❤️ by{" "}
        <span className="font-semibold text-white">Sofikul Seikh</span>.
      </p>
    </footer>
  );
}
