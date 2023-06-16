import prisma from "$lib/trpc/prisma";
import { log } from "$lib/trpc/services/logger";

export async function applyRestrictionModifiers() {
  try {
    const total = await prisma.restrictionModifier.count();
    let PAGE = 0;
    const TAKE = 20;

    do {
      const restrictionModifiers = await prisma.restrictionModifier.findMany({
        take: TAKE,
        skip: PAGE * TAKE,
      });

      PAGE += 1;

      const toDeleteModifierIDs: Array<string> = [];

      await Promise.all(restrictionModifiers
        .filter((modifier) => modifier.modifyDate && modifier.modifyDate <= new Date())
        .map((modifier) => {
          toDeleteModifierIDs.push(modifier.id);

          log('INFO', `Applying restriction modifier: ${JSON.stringify(modifier)}`);

          return prisma.restriction.update({
            where: { id: modifier.restrictionId, },
            data: {
              permissions: modifier.newPermissions,
            },
          })
        })
      );

      log('INFO', `Deleting restriction modifiers: ${JSON.stringify(toDeleteModifierIDs)}`);
      await prisma.restrictionModifier.deleteMany({
        where: {
          id: {
            in: toDeleteModifierIDs,
          },
        },
      });
    } while (PAGE * TAKE < total);
  } catch (error) {
    log('CRITICAL', `Cron job failed: ApplyRestriction : ${JSON.stringify(error)}`);
  }
}
