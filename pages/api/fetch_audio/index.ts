import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ pageName: "Home page" });
}

// export default function handler(req: any, res: any) {
//     const { method, query } = req;
//     switch (method) {
//         case 'GET':
//             res.status(200).json({ pageName: "Home page" });
//         case 'POST':
//             res.status(200).json({response: "POST Successful"})
//         default: 
//             res.setHeader('Allow', ['GET', 'POST'])
//     }
// }