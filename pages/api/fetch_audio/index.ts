import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    switch (method) {
        case 'GET':
            res.status(200).json({ pageName: "Home page" });
        case 'POST':
            res.status(200).json({response: req.body})
        default: 
            res.setHeader('Allow', ['GET', 'POST'])
    }
}