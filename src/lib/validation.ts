import { z } from "zod";

export const timeEntrySchema = z.object({
  entry_type: z.enum(["arrival", "departure"]),
  entry_time: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Neveljaven čas (HH:MM:SS)"),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neveljaven datum"),
});

export const updateTimeEntrySchema = timeEntrySchema.partial().extend({
  id: z.string().uuid(),
});

export const absenceSchema = z
  .object({
    absence_type: z.enum(["sick_leave", "vacation", "work_from_home"]),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neveljaven začetni datum"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neveljaven končni datum"),
    note: z.string().trim().max(500, "Opomba je predolga (max 500 znakov)").optional(),
  })
  .refine((v) => v.start_date <= v.end_date, {
    message: "Končni datum mora biti enak ali kasnejši od začetnega",
    path: ["end_date"],
  });
