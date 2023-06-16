import { z } from "zod";
import { t } from "../t";
import { comparePasswordToHash, getHashFromPassword } from "$lib/utils/hash-helpers";
import prisma from "../prisma";
import { generateJWT } from "$lib/utils/jwt";
import { ensureLoggedInProcedure } from "../middleware";
import { log } from "../services/logger";

const UsersController = t.router({
  login: t.procedure
    .input(z.object({ email: z.string().min(6).email(), password: z.string() }))
    .mutation(async (req) => {
      try {
        const user = await prisma.user
          .findFirst({ where: { email: req.input.email } });

        if (!user) return { error: 'Invalid credetials', token: null };

        const shouldAllowLogin = await comparePasswordToHash(req.input.password, user.password);

        if (!shouldAllowLogin) return { error: 'Invalid credetials', token: null };

        const token = generateJWT(user.email);

        return { error: null, token };
      } catch (error) {
        log('ERROR', `Failed to login: ${JSON.stringify(error)}`, req.ctx.user);
        return { error: 'Something went wrong', token: null };
      }
    }),

  register: t.procedure
    .input(z.object({
      email: z.string().min(1).email(), name: z.string().min(2), password: z.string().min(6),
      inviteHash: z.string().min(1)
    }))
    .mutation(async (req) => {
      console.log('register', req.input);
      const hash = await getHashFromPassword(req.input.password);

      if (!hash) return { error: 'Something went wrong', token: null };

      try {
        const userToInvite = await prisma.user
          .findFirst({ where: { inviteHash: req.input.inviteHash, email: req.input.email } });

        if (!userToInvite) {
          return { error: 'Invalid invite', token: null };
        }

        const user = await prisma.user
          .update({
            where: {
              email: req.input.email,
            },
            data: {
              password: hash,
              inviteHash: null,
            }
          });

        const token = generateJWT(user.email);

        return {
          token,
          error: null
        };
      } catch (error) {
        console.log('error', error);
        return { error: 'Something went wrong', token: null };
      }
    }),

  currentUser: ensureLoggedInProcedure
    .query(async (req) => {
      if (!req.ctx.user) return null;

      const user = await prisma.user.findFirst({
        where: { email: req.ctx.user.email }
      })

      if (user) {
        return { email: user.email, name: user.name, role: user.role };
      }

      return null;
    }),

  searchUsers: ensureLoggedInProcedure
    .input(z.string())
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') return [];

      try {
        const users = await prisma.user.findMany({
          where: { name: { contains: req.input, mode: 'insensitive' } },
          take: 10,
        });

        return users.map(u => ({ name: u.name || u.email, value: u.id.toString() }));
      } catch (error) {
        log('ERROR', `Failed  to search users: ${error}`, req.ctx.user);
        return [];
      }
    }),

  adminUserList: ensureLoggedInProcedure
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') return [];

      try {
        const users = await prisma.user.findMany({
          where: { name: { contains: req.input, mode: 'insensitive' } },
          take: 200,
          select: { id: true, name: true, email: true, role: true, inviteHash: true, createdAt: true }
        });

        return users;
      } catch (error) {
        log('ERROR', `Failed  to return admin users: ${error}`, req.ctx.user);
        return [];
      }
    }),

  adminCreateUser: ensureLoggedInProcedure
    .input(z.object({ email: z.string().min(1).email(), name: z.string().min(2) }))
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return {
          error: 'You are not allowed to do this',
          user: null,
        };
      }

      const hash = await getHashFromPassword(req.input.email);

      if (!hash) return {
        error: 'Error generating hash',
        user: null,
      };

      try {
        const user = await prisma.user
          .create({
            data: {
              email: req.input.email,
              name: req.input.name,
              inviteHash: hash,
            }
          });

        return {
          error: null,
          user,
        };
      } catch (error) {
        return {
          error: 'Something went wrong',
          user: null,
        };
      }
    }),

  adminGetResetPasswordToken: ensureLoggedInProcedure
    .input(z.object({ email: z.string().min(1).email() }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return {
          error: 'You are not allowed to do this',
          hash: null,
        };
      }

      try {
        const alreadyHasInviteUser = await prisma.user
          .findFirst({ where: { email: req.input.email } });

        if (alreadyHasInviteUser?.inviteHash) {
          return {
            error: null,
            hash: alreadyHasInviteUser.inviteHash,
          };
        }

        const hash = await getHashFromPassword(req.input.email);

        if (!hash) return {
          error: 'Error generating hash',
          hash: null,
        };

        await prisma.user
          .update({
            where: { email: req.input.email },
            data: {
              inviteHash: hash,
            }
          });

        return {
          error: null,
          hash,
        };
      } catch (error) {
        return {
          error: 'Something went wrong',
          hash: null,
        };
      }
    }),

  getUserByInviteHash: t.procedure
    .input(z.string())
    .query(async (req) => {
      try {
        const user = await prisma.user.findFirst({
          where: { inviteHash: req.input }
        });

        if (!user) return null;

        return { name: user.name, email: user.email, inviteHash: user.inviteHash };
      } catch (error) {
        log('ERROR', `Failed to get user by invite hash: ${error}`, req.ctx.user);
        return null;
      }
    }),

});

export default UsersController;
