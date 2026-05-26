import prisma from '../config/database';
import { PrismaClient } from '@prisma/client';

type PrismaModelName = keyof Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$extends'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$queryRaw'
  | '$queryRawUnsafe'
>;

// Generic DAO factory for simple CRUD operations
export const createGenericDao = (modelName: PrismaModelName) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (prisma as any)[modelName];

  return {
    async findAll(where?: object, include?: object, orderBy?: object) {
      return model.findMany({
        where: { deleted_at: null, ...where },
        include,
        orderBy: orderBy || { id: 'asc' },
      });
    },

    async findById(id: number, include?: object) {
      return model.findFirst({
        where: { id, deleted_at: null },
        include,
      });
    },

    async create(data: object) {
      return model.create({ data });
    },

    async update(id: number, data: object) {
      return model.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      });
    },

    async softDelete(id: number) {
      return model.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    },

    async count(where?: object) {
      return model.count({
        where: { deleted_at: null, ...where },
      });
    },

    async findMany(where?: object, skip?: number, take?: number, include?: object, orderBy?: object) {
      return model.findMany({
        where: { deleted_at: null, ...where },
        skip,
        take,
        include,
        orderBy: orderBy || { id: 'asc' },
      });
    },
  };
};

// Pre-created DAOs for all entities
export const projectDao = createGenericDao('project');
export const activityDao = createGenericDao('activity');
export const teamDao = createGenericDao('team');
export const materialDao = createGenericDao('material');
export const unitDao = createGenericDao('unit');
export const moduleDao = createGenericDao('module');
export const componentDao = createGenericDao('component');
export const blockDao = createGenericDao('block');
export const countryDao = createGenericDao('country');
export const checkListDao = createGenericDao('checkList');
export const userDao = createGenericDao('user');
export const ppvcTransactionDao = createGenericDao('pPVCTransaction');
