import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableComponentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  id,
  children,
  className,
}) => {
  const { setNodeRef } = useDraggable({
    id,
  });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
};

export default DraggableComponent;
