"use client";

import { useEffect, useState, useCallback } from "react";
import { DiningHallWithMenu, MenuItemRecord, DailyMenu } from "@/lib/types";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import { mockDiningHalls, mockMenuItems, mockDailyMenus, getMockHallGpa } from "@/lib/mock-data";
import DiningHallCard from "./DiningHallCard";
import MenuModal from "./MenuModal";

export default function DiningHallBar() {
  const [halls, setHalls] = useState<DiningHallWithMenu[]>([]);
  const [selectedHall, setSelectedHall] = useState<DiningHallWithMenu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase()!;
        const today = new Date().toISOString().slice(0, 10);

        const { data: hallRows } = await supabase
          .from("dining_halls")
          .select("*")
          .order("name");

        if (hallRows) {
          const hallsWithMenus: DiningHallWithMenu[] = await Promise.all(
            hallRows.map(async (hall) => {
              const { data: menuRows } = await supabase
                .from("daily_menus")
                .select("*")
                .eq("dining_hall_id", hall.id)
                .eq("date", today)
                .in("meal_period", ["dinner", "brunch"])
                .limit(1);

              // Calculate dynamic GPA using RPC function (with fallback)
              let calculatedGpa = hall.gpa;
              try {
                const { data: gpaData, error } = await supabase
                  .rpc("calculate_hall_gpa", {
                    p_hall_id: hall.id,
                    p_date: today,
                  });

                if (!error && gpaData != null) {
                  calculatedGpa = gpaData;
                }
              } catch (err) {
                console.warn("GPA calculation failed, using static GPA:", err);
              }

              return {
                ...hall,
                gpa: calculatedGpa,
                menu: menuRows && menuRows.length > 0 ? menuRows[0] : null,
              };
            })
          );
          setHalls(hallsWithMenus);
          return;
        }
      }
      // Use mock data with dynamically calculated GPAs
      const today = new Date().toISOString().slice(0, 10);
      const hallsWithDynamicGpa = mockDiningHalls.map((hall) => ({
        ...hall,
        gpa: getMockHallGpa(hall.id, today),
      }));
      setHalls(hallsWithDynamicGpa);
    }
    load();
  }, []);

  const handleCardClick = useCallback(
    async (hall: DiningHallWithMenu) => {
      setSelectedHall(hall);
      setModalLoading(true);

      try {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase()!;
          const today = new Date().toISOString().slice(0, 10);

          const [itemsRes, menusRes] = await Promise.all([
            supabase
              .from("menu_items")
              .select("*")
              .eq("dining_hall_id", hall.id)
              .eq("date", today),
            supabase
              .from("daily_menus")
              .select("*")
              .eq("dining_hall_id", hall.id)
              .eq("date", today),
          ]);

          setMenuItems(itemsRes.data ?? []);
          setDailyMenus(menusRes.data ?? []);
        } else {
          setMenuItems(mockMenuItems.filter((mi) => mi.dining_hall_id === hall.id));
          setDailyMenus(mockDailyMenus.filter((dm) => dm.dining_hall_id === hall.id));
        }
      } finally {
        setModalLoading(false);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedHall(null);
    setMenuItems([]);
    setDailyMenus([]);
    setModalLoading(false);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">
          Today&apos;s Menu
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {halls.map((hall) => (
            <DiningHallCard
              key={hall.id}
              hall={hall}
              onClick={() => handleCardClick(hall)}
            />
          ))}
        </div>
      </div>

      {selectedHall && (
        <MenuModal
          hall={selectedHall}
          menuItems={menuItems}
          dailyMenus={dailyMenus}
          loading={modalLoading}
          onClose={handleClose}
        />
      )}
    </>
  );
}
