import React, { useState } from "react";
import WeaponCard from "./WeaponCard";
import { Weapon } from "@/graphql/types";

interface WeaponsDetailedGridProps {
  weapons: Weapon[];
}

/**
 * WeaponsDetailedGrid component displays a grid of weapon cards with filtering capabilities.
 *
 * Features:
 * - Search weapons by name
 * - Filter weapons by rarity (1-5 stars)
 * - Responsive grid layout
 *
 * @component
 * @param {Object} props
 * @param {Weapon[]} props.weapons - Array of weapon objects to display
 */
const WeaponsDetailedGrid: React.FC<WeaponsDetailedGridProps> = ({
  weapons,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRarityClick = (rarity: number) => {
    setSelectedRarity(rarity);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredWeapons = weapons
    .filter((weapon) =>
      selectedRarity ? weapon.rarity === selectedRarity : true
    )
    .filter((weapon) =>
      weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="mt-8">
      <div className="flex justify-center mb-4">
        <div className="relative w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search weapons..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-4 justify-center">
        {[1, 2, 3, 4, 5].map((rarity) => (
          <button
            key={rarity}
            onClick={() => handleRarityClick(rarity)}
            className={`chip ${selectedRarity === rarity ? "selected" : ""}`}
            style={{
              backgroundColor:
                selectedRarity === rarity ? "#006400" : "#f0f0f0",
              padding: "8px 16px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {rarity} ★
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-8">
        {filteredWeapons.map((weapon) => (
          <WeaponCard key={weapon.name} weapon={weapon} />
        ))}
      </div>
    </div>
  );
};

export default WeaponsDetailedGrid;
