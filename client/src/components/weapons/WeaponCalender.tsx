import React, { useEffect, useMemo } from "react";
import { useWeaponMaterials } from "@/redux/hook/weapon-material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ScheduleTable from "./ScheduleTable";

const WeaponCalender: React.FC = () => {
  const { weaponMaterialSchedule, loading, error, fetchWeaponMaterials } =
    useWeaponMaterials();

  useEffect(() => {
    if (weaponMaterialSchedule === null) fetchWeaponMaterials();
  }, [weaponMaterialSchedule, fetchWeaponMaterials]);

  const nations = useMemo(() => {
    if (weaponMaterialSchedule === null) return [];
    return weaponMaterialSchedule.map((schedule) => schedule.nation);
  }, [weaponMaterialSchedule]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (weaponMaterialSchedule === null) return <div>No data</div>;
  return (
    <div>
      <Tabs>
        <TabsList>
          {nations.map((nation) => {
            return (
              <TabsTrigger key={nation} value={nation}>
                {nation}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="Mondstadt">
          <ScheduleTable schedule={weaponMaterialSchedule[0]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeaponCalender;
