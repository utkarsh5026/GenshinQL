import React, { useState } from "react";
import DroppableArea from "./DroppableArea";

interface TierLevelProps {
  name: string;
  isValidName: (name: string) => boolean;
  onNameChange: (oldName: string, newName: string) => void;
  children: React.ReactNode;
}

const TierLevel: React.FC<TierLevelProps> = ({
  name,
  isValidName,
  onNameChange,
  children,
}) => {
  const [editableName, setEditableName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (isValidName(editableName)) {
      onNameChange(name, editableName);
    } else {
      setEditableName(name);
    }
  };

  return (
    <div className="w-full border-2 border-gray-300 flex min-h-[100px]">
      <div
        className={`w-32 min-w-32 flex items-center justify-center text-lg font-bold  p-2 break-words bg-gray-600`}
      >
        {isEditing ? (
          <input
            title={editableName}
            type="text"
            value={editableName}
            onChange={handleNameChange}
            onBlur={handleBlur}
            autoFocus
            className="w-full bg-transparent text-center border-none overflow-hidden text-ellipsis"
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="cursor-pointer break-words w-full text-center"
          >
            {editableName}
          </span>
        )}
      </div>
      <DroppableArea
        id={editableName}
        className="flex-1 border-2 border-gray-300 bg-transparent p-2"
      >
        {children}
      </DroppableArea>
    </div>
  );
};

export default TierLevel;
