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

interface ScheduleTableProps {
  schedule: WeaponMaterialSchedule;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule }) => {
  const { materials } = schedule;
  const today = getCurrentDay();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Material</TableHead>
          <TableHead>Weapon</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.day}>
            <TableCell
              className={`font-medium text-left ${
                material.day.toLowerCase().includes(today.toLowerCase())
                  ? "text-green-500"
                  : ""
              }`}
            >
              {material.day}
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
