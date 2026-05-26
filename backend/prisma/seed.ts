import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Seed Units ──────────────────────────────────────────────────────────────
  const units = await Promise.all([
    prisma.unit.upsert({ where: { id: 1 }, update: {}, create: { name: 'Unit A', code: 'UA', status: true } }),
    prisma.unit.upsert({ where: { id: 2 }, update: {}, create: { name: 'Unit B', code: 'UB', status: true } }),
    prisma.unit.upsert({ where: { id: 3 }, update: {}, create: { name: 'Unit C', code: 'UC', status: true } }),
  ]);
  console.log(`✅ Seeded ${units.length} units`);

  // ── Seed Teams ──────────────────────────────────────────────────────────────
  const teams = await Promise.all([
    prisma.team.upsert({ where: { id: 1 }, update: {}, create: { name: 'Production Team A', code: 'PTA', status: true } }),
    prisma.team.upsert({ where: { id: 2 }, update: {}, create: { name: 'QC Team', code: 'QCT', status: true } }),
    prisma.team.upsert({ where: { id: 3 }, update: {}, create: { name: 'Delivery Team', code: 'DLT', status: true } }),
    prisma.team.upsert({ where: { id: 4 }, update: {}, create: { name: 'Installation Team', code: 'INS', status: true } }),
  ]);
  console.log(`✅ Seeded ${teams.length} teams`);

  // ── Seed Admin User ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@ppvc.com',
      password_hash: passwordHash,
      role: 'admin',
      landing_page: '/Admin/Dashboard',
      status: true,
    },
  });
  console.log(`✅ Seeded admin user: ${adminUser.username}`);

  // Also seed the original plain-text user for backward compatibility
  await prisma.user.upsert({
    where: { username: 'sadmin' },
    update: {},
    create: {
      username: 'sadmin',
      name: 'Super Admin',
      email: 'sadmin@ppvc.com',
      password_hash: '123', // plain text for legacy compatibility
      role: 'admin',
      landing_page: '/Admin/Dashboard',
      status: true,
    },
  });

  // ── Seed Materials ──────────────────────────────────────────────────────────
  const materials = await Promise.all([
    prisma.material.upsert({ where: { id: 1 }, update: {}, create: { name: 'Concrete Grade 40', code: 'CON40', status: true } }),
    prisma.material.upsert({ where: { id: 2 }, update: {}, create: { name: 'Rebar T16', code: 'RBT16', status: true } }),
    prisma.material.upsert({ where: { id: 3 }, update: {}, create: { name: 'MEP Works', code: 'MEP', status: true } }),
  ]);
  console.log(`✅ Seeded ${materials.length} materials`);

  // ── Seed Projects ────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'PPVC Demo Project',
      code: 'PPV-001',
      client_name: 'Demo Client Pte Ltd',
      location: 'Singapore',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2025-12-31'),
      model_reference: 'BIM-REF-001',
      model_ref_location: 'BIM Server',
      status: true,
    },
  });
  console.log(`✅ Seeded project: ${project.name}`);

  // ── Seed Modules ─────────────────────────────────────────────────────────────
  const modules = await Promise.all([
    prisma.module.upsert({ where: { id: 1 }, update: {}, create: { name: 'Module Type A', code: 'MTA', unit_id: 1, status: true } }),
    prisma.module.upsert({ where: { id: 2 }, update: {}, create: { name: 'Module Type B', code: 'MTB', unit_id: 2, status: true } }),
    prisma.module.upsert({ where: { id: 3 }, update: {}, create: { name: 'Module Type C', code: 'MTC', unit_id: 3, status: true } }),
  ]);
  console.log(`✅ Seeded ${modules.length} modules`);

  // ── Seed Activities ──────────────────────────────────────────────────────────
  // Activity IDs match the original .NET system (1,3,6 = PreCasting; 2,4,7 = QC; 5 = Delivery)
  const activities = await Promise.all([
    prisma.activity.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'Pre-Casting', code: 'PRE', status: true } }),
    prisma.activity.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'QC Inspection', code: 'QCI', status: true } }),
    prisma.activity.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: 'Pre-Casting Stage 2', code: 'PRE2', status: true } }),
    prisma.activity.upsert({ where: { id: 4 }, update: {}, create: { id: 4, name: 'QC Inspection Stage 2', code: 'QCI2', status: true } }),
    prisma.activity.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: 'Delivery', code: 'DEL', status: true } }),
    prisma.activity.upsert({ where: { id: 6 }, update: {}, create: { id: 6, name: 'Pre-Casting Stage 3', code: 'PRE3', status: true } }),
    prisma.activity.upsert({ where: { id: 7 }, update: {}, create: { id: 7, name: 'QC Final', code: 'QCFIN', status: true } }),
  ]);
  console.log(`✅ Seeded ${activities.length} activities`);

  // Sub-activities for Pre-Casting
  const subActivities = await Promise.all([
    prisma.activity.upsert({
      where: { id: 8 }, update: {},
      create: { id: 8, name: 'Casting', code: 'CAST', parent_activity_id: 1, status: true },
    }),
    prisma.activity.upsert({
      where: { id: 9 }, update: {},
      create: { id: 9, name: 'Curing', code: 'CURE', parent_activity_id: 1, status: true },
    }),
    prisma.activity.upsert({
      where: { id: 10 }, update: {},
      create: { id: 10, name: 'De-Moulding', code: 'DEMO', parent_activity_id: 1, status: true },
    }),
    prisma.activity.upsert({
      where: { id: 11 }, update: {},
      create: { id: 11, name: 'Visual Inspection', code: 'VIS', parent_activity_id: 2, status: true },
    }),
    prisma.activity.upsert({
      where: { id: 12 }, update: {},
      create: { id: 12, name: 'Dimensional Check', code: 'DIM', parent_activity_id: 2, status: true },
    }),
  ]);
  console.log(`✅ Seeded ${subActivities.length} sub-activities`);

  // ── Seed Components ──────────────────────────────────────────────────────────
  const components = await Promise.all([
    prisma.component.upsert({
      where: { id: 1 }, update: {},
      create: { name: 'Component A-01', code: 'CA-01', module_id: 1, material_id: 1, status: true },
    }),
    prisma.component.upsert({
      where: { id: 2 }, update: {},
      create: { name: 'Component B-01', code: 'CB-01', module_id: 2, material_id: 1, status: true },
    }),
    prisma.component.upsert({
      where: { id: 3 }, update: {},
      create: { name: 'Component C-01', code: 'CC-01', module_id: 3, material_id: 2, status: true },
    }),
  ]);
  console.log(`✅ Seeded ${components.length} components`);

  // ── Seed Countries ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.country.upsert({ where: { id: 1 }, update: {}, create: { name: 'Singapore', code: 'SG', status: true } }),
    prisma.country.upsert({ where: { id: 2 }, update: {}, create: { name: 'Malaysia', code: 'MY', status: true } }),
  ]);
  console.log(`✅ Seeded countries`);

  // ── Seed Blocks ──────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.block.upsert({ where: { id: 1 }, update: {}, create: { name: 'Block A', code: 'BLK-A', status: true } }),
    prisma.block.upsert({ where: { id: 2 }, update: {}, create: { name: 'Block B', code: 'BLK-B', status: true } }),
  ]);
  console.log(`✅ Seeded blocks`);

  // ── Seed Sample PPVC Transactions ────────────────────────────────────────────
  // Create Level 1 (activity headers) for the demo project
  const levelOneActivities = [1, 2, 3, 4, 5]; // Main workflow activities
  for (const activityId of levelOneActivities) {
    await prisma.pPVCTransaction.upsert({
      where: { id: activityId * 100 },
      update: {},
      create: {
        id: activityId * 100,
        project_id: 1,
        activity_id: activityId,
        level_id: 1,
        planning_module_status: activityId === 1 ? 1 : 0,
        complete_percent: '0',
        status: true,
      },
    });
  }

  // Create Level 2 (component rows) for pre-casting (activity 1)
  for (let i = 1; i <= 3; i++) {
    await prisma.pPVCTransaction.upsert({
      where: { id: 1000 + i },
      update: {},
      create: {
        id: 1000 + i,
        project_id: 1,
        module_id: i,
        activity_id: 1,
        component_id: i,
        team_id: 1,
        level_id: 2,
        planning_module_status: 1,
        complete_percent: '0',
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-06-30'),
        status: true,
      },
    });
  }

  console.log(`✅ Seeded sample PPVC transactions`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('   Username: admin | Password: admin123');
  console.log('   Username: sadmin | Password: 123 (legacy)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
