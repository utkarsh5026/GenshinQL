import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableComponentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  id,
  children,
  className,
  data,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    scale: transform ? 2 : 1,
    transition: "transform ease",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
};

export default DraggableComponent;
