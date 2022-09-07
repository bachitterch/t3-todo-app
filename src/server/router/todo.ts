import { z } from 'zod'
import { createRouter } from './context'
import * as trpc from '@trpc/server';

export const todoRouter = createRouter()
.query('getTodos', {
  async resolve({ ctx }) {
      try {
        return await ctx.prisma.todo.findMany({
          where: {
            userId: ctx.session?.user?.id as string
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.log("error", error);
      }
  },
})
.middleware(async({ctx, next}) => {
  if (!ctx.session) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
})
.mutation("createTodo", {
  input: z.object({
    todo: z.string(),
    completed: z.boolean()
  }),
  async resolve({ ctx, input }) {
    try {
      await ctx.prisma.todo.create({
        data: {
          todo: input.todo,
          completed: input.completed,
          userId: ctx.session?.user?.id as string
        }
      })
    } catch(error) {
      console.error(error)
    }
  }
})
.mutation('updateTodo', {
  input: z.object({
    id: z.string(),
    completed: z.boolean(),
  }),
  async resolve({ctx, input}) {
    try {
      await ctx.prisma.todo.update({
        where: {
          id: input.id
        },
        data: {
          completed: input.completed,
        }
      })
    } catch(error) {
      console.error(error)
    }

  }
})
