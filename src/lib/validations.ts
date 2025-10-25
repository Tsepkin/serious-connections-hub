import { z } from "zod";

export const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(100, "Имя не может быть длиннее 100 символов"),
  age: z.number()
    .int("Возраст должен быть целым числом")
    .min(18, "Возраст должен быть минимум 18 лет")
    .max(100, "Возраст не может быть больше 100 лет"),
  city: z.string()
    .trim()
    .min(2, "Название города должно содержать минимум 2 символа")
    .max(100, "Название города не может быть длиннее 100 символов"),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Введите корректный номер телефона в международном формате"),
  about_me: z.string()
    .trim()
    .min(10, "Описание должно содержать минимум 10 символов")
    .max(1000, "Описание не может быть длиннее 1000 символов"),
  values: z.string()
    .trim()
    .min(10, "Опишите ваши ценности (минимум 10 символов)")
    .max(1000, "Описание ценностей не может быть длиннее 1000 символов"),
  family_goals: z.string()
    .trim()
    .min(10, "Опишите ваши семейные цели (минимум 10 символов)")
    .max(1000, "Описание целей не может быть длиннее 1000 символов"),
  photo_url: z.string().url("Некорректный URL фотографии").optional().or(z.literal("")),
});

export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Сообщение не может быть пустым")
    .max(2000, "Сообщение не может быть длиннее 2000 символов"),
});

export const reviewSchema = z.object({
  rating: z.number()
    .int("Рейтинг должен быть целым числом")
    .min(1, "Минимальный рейтинг: 1")
    .max(5, "Максимальный рейтинг: 5"),
  comment: z.string()
    .trim()
    .max(500, "Комментарий не может быть длиннее 500 символов")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
