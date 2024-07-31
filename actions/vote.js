'use server';

import { db } from '@/lib/db';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const vote = async (party) => {
    const cookieStore = cookies();
    const voterId = cookieStore.get('voterId')?.value;

    console.log(`Cookie value: ${voterId}`);

    if (!voterId) {
        console.error('No voterId cookie found');
        return { ok: false, error: 'Access Denied!' };
    }

    try {
        console.log(`Fetching vote record for voterId: ${voterId}`);
        const isAlreadyVoted = await db.vote.findFirst({
            where: { id: voterId },
            select: { candidate: true },
        });

        console.log('isAlreadyVoted:', isAlreadyVoted);

        if (isAlreadyVoted?.candidate) {
            console.error('User has already voted');
            return { ok: false, error: 'You have already voted! You cannot vote again.' };
        }

        console.log(`Updating vote for voterId: ${voterId} with party code: ${party.code}`);
        const response = await db.vote.update({
            where: { id: voterId },
            data: { candidate: party.code },
        });

        console.log('Vote updated:', response);

        // Use a return statement here if redirect doesn't work as expected
        return { ok: true, message: 'Vote submitted successfully!' };

    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            ok: false,
            error: 'Something went wrong! Please try again later.',
        };
    }
};

export default vote;

