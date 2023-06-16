import { z } from "zod";

export const createFolderRestriction = z.object({
  restrictionID: z.string().uuid(),
  path: z.string(),
  folderName: z.string(),

  shareWith: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),

  canEdit: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canWrite: z.boolean().optional(),

  afterDate: z.string().optional(),
  modifierCanEdit: z.boolean().optional(),
  modifierCanRead: z.boolean().optional(),
  modifierCanDelete: z.boolean().optional(),
  modifierCanWrite: z.boolean().optional(),
})

export const editFolderRestriction = z.object({
  restrictionID: z.string().uuid(),

  shareWith: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),

  canEdit: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canWrite: z.boolean().optional(),

  afterDate: z.string().optional(),
  modifierCanEdit: z.boolean().optional(),
  modifierCanRead: z.boolean().optional(),
  modifierCanDelete: z.boolean().optional(),
  modifierCanWrite: z.boolean().optional(),
})
