import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        createa_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);
    const parsedDate = dayjs(date).startOf("day");

    // todos habitos possiveis
    // habitos que já foram completados

    const weekDay = dayjs(date).get("day");
    const possibleHabits = await prisma.habit.findMany({
      where: {
        createa_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits =
      day?.dayHabits.map((dayHabit) => {
        return dayHabit.habit_id;
      }) ?? [];
    return {
      possibleHabits,
      completedHabits,
    };
  });

  //rota para completar ou náo completar os habitos
  app.patch("/habits/:id/toogle", async (request) => {
    const toogleHabitsParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toogleHabitsParams.parse(request.params);

    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      //completar o habito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  // rota com sql nativo do sqlite
  app.get("/summary", async () => {
    const summary = await prisma.$queryRaw`
            SELECT 
                D.id,
                D.date,
                (
                    SELECT
                        cast(count(*) as float)
                    FROM day_habits DH
                    WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM habit_week_days HWD
                    JOIN habits h 
                        ON H.id = HWD.habit_id
                    WHERE 
                        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        AND H.createa_at <= D.date
                ) as amount
            FROM days D
        `;
    return summary;
  });
}
