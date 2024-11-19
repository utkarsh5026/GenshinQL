import { getCurrentDay } from "@/utils/day";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { WeaponMaterialSchedule } from "@/graphql/types";
import WeaponShowCase from "./WeaponShowCase";
import AvatarWithSkeleton from "../utils/AvatarWithSkeleton";

interface ScheduleTableProps {
  schedule: WeaponMaterialSchedule;
}

/**
 * ScheduleTable component displays a table of weapon materials and their availability schedule
 *
 * @component
 * @param {Object} props - Component props
 * @param {WeaponMaterialSchedule} props.schedule - Schedule data containing materials and weapons for each day
 * @returns {JSX.Element} A table showing weapon materials and associated weapons organized by day
 *
 * The table has 3 columns:
 * - Day: Shows the day of the week, with current day highlighted in green
 * - Weapon: Displays material images in a 2-column grid with captions
 * - Material: Shows available weapons using WeaponShowCase component
 */
const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule }) => {
  const { materials } = schedule;
  const today = getCurrentDay();

  // Reorder materials to have today first, or Sunday if today is not found
  const reorderedMaterials = [...materials];
  const todayIndex = reorderedMaterials.findIndex((material) =>
    material.day.toLowerCase().includes(today.toLowerCase())
  );

  if (todayIndex !== -1) {
    const [todayMaterial] = reorderedMaterials.splice(todayIndex, 1);
    reorderedMaterials.unshift(todayMaterial);
  } else {
    const sundayIndex = reorderedMaterials.findIndex(
      (material) => material.day.toLowerCase() === "sunday"
    );
    if (sundayIndex !== -1) {
      const [sundayMaterial] = reorderedMaterials.splice(sundayIndex, 1);
      reorderedMaterials.unshift(sundayMaterial);
    }
  }

  return (
    <Table className="border-2 border-amber-500/50">
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Weapon</TableHead>
          <TableHead>Material</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reorderedMaterials.map((material) => (
          <TableRow
            key={material.day}
            className={`${
              material.day.toLowerCase().includes(today.toLowerCase())
                ? "bg-green-950 hover:bg-green-950"
                : ""
            }`}
          >
            <TableCell className="font-medium text-left">
              {`${material.day} ${
                material.day.toLowerCase().includes(today.toLowerCase())
                  ? "(Today)"
                  : ""
              }`}
            </TableCell>
            <TableCell>
              <div className="grid grid-cols-2">
                {material.materialImages.map((image) => (
                  <div key={image.url}>
                    <AvatarWithSkeleton
                      key={image.url}
                      name={image.caption}
                      url={image.url}
                      avatarClassName="w-12 h-12 border-2 border-gray-500 my-2 p-1"
                    />
                    <span className="text-xs text-gray-500">
                      {image.caption}
                    </span>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <WeaponShowCase weapons={material.weapons} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ScheduleTable;
