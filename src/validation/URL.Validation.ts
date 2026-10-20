import z from 'zod';


export const genreate_Url_Schema = z.object({
    original_url: z.string().min(8)
})

