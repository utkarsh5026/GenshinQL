import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A droppable area component that can contain draggable elements
 * @param id - Unique identifier for the droppable area
 * @param children - React child elements that can be dropped into this area
 * @param className - Optional CSS classes to apply to the container
 * @returns A div that acts as a drop target, highlighting when items are dragged over it
 */
const DroppableArea: React.FC<DroppableAreaProps> = ({
  id,
  children,
  className,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "bg-slate-900" : ""} flex flex-row`}
    >
      {children}
    </div>
  );
};

export default DroppableArea;
