import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const CharacterDrawer: React.FC = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Character Drawer</Button>
      </DrawerTrigger>
      <DrawerContent className="fixed inset-y-0 right-0 h-full w-[400px] flex-col border-l">
        <DrawerHeader>
          <DrawerTitle>Character Details</DrawerTitle>
          <DrawerDescription>
            View and edit character information here.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add your character content here */}
          <p>Character content goes here...</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CharacterDrawer;
