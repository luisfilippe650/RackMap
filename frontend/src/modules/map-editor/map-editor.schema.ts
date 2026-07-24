import { z } from 'zod';

export const simpleMapCreateSchema = z.object({
  name: z.string().trim().min(1, 'Preencha o nome do mapa.'),
  description: z.string().max(255, 'Descricao deve ter no maximo 255 caracteres').optional(),
  columnCount: z.number({ error: 'Preencha a largura em blocos.' }).int('A largura em blocos precisa ser um numero inteiro.').positive('A largura em blocos deve ser maior que zero.'),
  rowCount: z.number({ error: 'Preencha a altura em blocos.' }).int('A altura em blocos precisa ser um numero inteiro.').positive('A altura em blocos deve ser maior que zero.')
});

export type SimpleMapCreateForm = z.infer<typeof simpleMapCreateSchema>;
