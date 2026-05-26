import { z } from 'zod';

const baseSchema = z.object({
  status: z.boolean().optional().default(true),
  created_by_id: z.number().optional(),
  updated_by_id: z.number().optional(),
});

export const projectSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Project name is required').max(300),
    code: z.string().max(100).optional(),
    client_name: z.string().max(300).optional(),
    location: z.string().max(500).optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    model_reference: z.string().max(500).optional(),
    model_ref_location: z.string().max(500).optional(),
  }),
});

export const activitySchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Activity name is required').max(300),
    code: z.string().max(100).optional(),
    parent_activity_id: z.number().optional().nullable(),
  }),
});

export const teamSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Team name is required').max(200),
    code: z.string().max(100).optional(),
    activity: z.string().max(200).optional(),
    remarks: z.string().optional(),
  }),
});

export const materialSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Material name is required').max(200),
    code: z.string().max(100).optional(),
  }),
});

export const unitSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Unit name is required').max(200),
    code: z.string().max(100).optional(),
  }),
});

export const moduleSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Module name is required').max(300),
    code: z.string().max(100).optional(),
    short_description: z.string().max(500).optional(),
    description: z.string().optional(),
    module_type: z.string().max(100).optional(),
    unit_id: z.number().optional().nullable(),
  }),
});

export const componentSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Component name is required').max(300),
    code: z.string().max(100).optional(),
    module_id: z.number().optional().nullable(),
    material_id: z.number().optional().nullable(),
    rfid: z.string().max(200).optional(),
    dimension: z.string().max(200).optional(),
    remarks: z.string().optional(),
  }),
});

export const blockSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Block name is required').max(200),
    code: z.string().max(100).optional(),
  }),
});

export const countrySchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Country name is required').max(200),
    code: z.string().max(50).optional(),
  }),
});

export const checkListSchema = z.object({
  body: baseSchema.extend({
    name: z.string().min(1, 'Checklist name is required').max(300),
  }),
});

export const userSchema = z.object({
  body: baseSchema.extend({
    username: z.string().min(1, 'Username is required').max(100),
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['admin', 'manager', 'engineer', 'user']).optional(),
    team_id: z.number().optional().nullable(),
    is_leader: z.boolean().optional(),
    landing_page: z.string().optional(),
  }),
});

export const ppvcTransactionSchema = z.object({
  body: z.object({
    id: z.number().optional(),
    project_id: z.number().optional().nullable(),
    module_id: z.number().optional().nullable(),
    activity_id: z.number().optional().nullable(),
    sub_activity_id: z.number().optional().nullable(),
    component_id: z.number().optional().nullable(),
    man_days: z.number().optional().nullable(),
    team_id: z.number().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    dependency: z.number().optional().nullable(),
    lead_time: z.number().optional().nullable(),
    complete_percent: z.string().optional(),
    planning_module_status: z.number().optional(),
    actual_start_date: z.string().optional().nullable(),
    actual_end_date: z.string().optional().nullable(),
    remarks: z.string().optional(),
    level_id: z.number().optional(),
    unit_level_no: z.string().optional(),
    expected_result: z.string().optional(),
    actual_result: z.string().optional(),
    defect_remarks: z.string().optional(),
    reassign_to: z.number().optional().nullable(),
    target_location: z.string().optional(),
    vehicle_no: z.string().optional(),
    rfid_tag: z.string().optional(),
    status: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});
