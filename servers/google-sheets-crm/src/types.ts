import { z } from "zod";

export const STATUSES = ["new", "in_progress", "success", "rejected"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export const LeadCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email(),
  contact_type: z.enum(["telegram", "whatsapp"]),
  contact: z.string().trim().min(1).max(255),
  message: z.string().max(8000).optional().nullable(),
});

export const LeadStatusUpdateSchema = z.object({
  status: z.enum(STATUSES),
});

export const LeadUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  email: z.string().trim().email().optional(),
  contact_type: z.enum(["telegram", "whatsapp"]).optional(),
  contact: z.string().trim().min(1).max(255).optional(),
  message: z.string().max(8000).nullable().optional(),
  status: z.enum(STATUSES).optional(),
});

export type LeadRow = {
  id: number;
  name: string;
  email: string;
  contact_type: "telegram" | "whatsapp";
  contact: string;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

export type BoardResponse = Record<LeadStatus, LeadRow[]>;
