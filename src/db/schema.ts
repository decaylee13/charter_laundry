import {
    pgTable, text, integer, boolean, timestamp, serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    netId: text("net_id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const machines = pgTable("machines", {
    machineId: serial("machine_id").primaryKey(),
    type: text("type", { enum: ["washer", "dryer"] }).notNull(),
    label: text("label").notNull(),
});

export const reservations = pgTable("reservations", {
    reservationId: serial("reservation_id").primaryKey(),
    machineId: integer("machine_id").notNull().references(() => machines.machineId, { onDelete: "cascade" }),
    netId: text("net_id").notNull().references(() => users.netId),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
    machine: one(machines, { fields: [reservations.machineId], references: [machines.machineId] }),
    officer: one(users, { fields: [reservations.netId], references: [users.netId] }),
}));

export const machinesRelations = relations(machines, ({ many }) => ({
    reservations: many(reservations),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Machine = typeof machines.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type ReservationWithMachineAndOfficer = Reservation & {
    machine: Machine;
    officer: User;
};
