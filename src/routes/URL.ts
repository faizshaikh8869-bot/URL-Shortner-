import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../prisma/db';
// import { Prisma } from '@prisma/client';
import { structuredError } from '@prisma/orm-postgres/utils/structured-error';
import crypto from 'crypto';

import { genreate_Url_Schema } from '../validation/URL.Validation'
import { URL } from 'url';
const urlRoute = Router();


function generateShortCode(length: number = 6): string {
    return crypto.randomBytes(Math.ceil((length * 3) / 4))
        .toString('base64url')
        .substring(0, length);
}

function isValidHttpUrl(input: string): boolean {
    try {
        const newUrl = new URL(input);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

const baseURL = 'http://localhost:3000/'



urlRoute.get('/all-urls', async (_req: Request, res: Response): Promise<void> => {
    try {

        const allUrls = await db.orm.public.Short_URL.all();

        res.status(200).json({
            message: 'All the urls',
            data: allUrls
        });

    } catch (ERr) {
        console.error('Failed to fetch URLs:', ERr);

        res.status(500).json({
            message: 'Internal server error',
            error: ERr instanceof Error ? ERr?.message : 'Unknown error'
        });
    }
})

// Get apropriat https://domain_name request 

// Redirect Logic -->Generate Short Code and REturn redirsct link
urlRoute.post('/genreate', async (req: Request, res: Response) => {
    const result = genreate_Url_Schema.safeParse(req.body);
    // zod later
    if (!result.success) {
        console.log('Input Error in Generate :- ', result.error);
        res.status(400).json({
            message: 'Invalid URL input payload',
            errors: result.error.cause
        });
        return;
    }


    const { original_url } = result.data;
    const check = isValidHttpUrl(original_url)
    if (!check) {
        res.status(400).json({
            message: 'Inapropriate Input URL',
        });
    }
    // check if the corect input is taken 

    const ShortCode = generateShortCode(6);


    let attempts = 0;
    while (attempts < 10) {
        try {
            // call for pushing the data in db 
            await db.orm.public.Short_URL.create({

                ShortCode: ShortCode,
                original_url: original_url,
                status: true,
                no_visitors: 1,
            });

            res.status(200).json({
                message: 'Short url created',
                data: {
                    shortCode: ShortCode,
                    shortURL: `${baseURL}v1/${ShortCode}`
                }
            });
            return;

        } catch (ERr: any) {
            // When the Duplicate strig is trying to add in the db the db return as error 
            //      Error of type Prisma.PrismaClientKnownRequestError
            //      And returns message of Unique constraint failed on the field with name 
            //      Error code === p20002
            // if (ERr instanceof Prisma.PrismaClientKnownRequestError) {
            const ErrCode = ERr?.code;
            const sqlState = ERr?.sqlState;

            // if(structuredError(ERr?.code, ERr.message)){
            // if (ERr.code === '23505') {

            if (ErrCode === 'P2002' || sqlState === '23505' || ERr?.message?.includes('unique constraint')) {
                console.log('A record with this unique string already exists. ATTEMPT:- ', attempts);
                attempts++;

                continue;
                // }   
            }

            console.log(ERr);
            res.status(500).json({
                message: 'Internal Server Error',
            })
        }
    }

    res.status(500).json({
        message: 'Faield To generate uniqe Short Code',
    });
})

urlRoute.get('/:shortCode', async (req: Request, res: Response) => {
    const shortCode = req.params.shortCode;

    if (!shortCode || typeof shortCode !== 'string') {
        return res.status(400).json({
            message: "Invalid or missing short code."
        });
    }

    try {
        // check in db 
        const ExistInDB = await db.orm.public.Short_URL.where({
            ShortCode: shortCode
        }).first()


        if (!ExistInDB || !ExistInDB?.original_url) {
            res.status(400).json({
                message: 'Url Dose not Exist',
            })
            return;
        }

        // await db.raw.sql`
        // UPDATE "Short_URL" 
        // SET "no_visitors" = "no_visitors" + 1 
        // WHERE "ShortCode" = ${shortCode}`;

        // redirect the user to the link 
        res.redirect(ExistInDB.original_url);

    } catch (ERr: any) {
        // Unhandled Exceptions 

        // console.log("Some error in redirect route:- ", ERr);
        console.error("Caught error in redirect route safely:", ERr?.message || ERr);

        res.status(500).json({
            message: 'Internal server error',
        });
    }
});



export default urlRoute;