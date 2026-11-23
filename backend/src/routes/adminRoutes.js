import { Router } from 'express';
import {
  getAdminPermissions,
  listAdminUsers,
  patchAdminUser,
  putAdminPermission,
} from '../controllers/adminController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  adminUpdatePermissionSchema,
  adminUpdateUserSchema,
} from '../schemas/reviewSchemas.js';

const router = Router();

router.use(requireAuth, requirePermission('rbac:manage'));

router.get('/users', listAdminUsers);
router.patch('/users/:userId', validateBody(adminUpdateUserSchema), patchAdminUser);
router.get('/permissions', getAdminPermissions);
router.put('/permissions', validateBody(adminUpdatePermissionSchema), putAdminPermission);

export default router;
