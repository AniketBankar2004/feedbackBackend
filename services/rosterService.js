let cache = {}

const CACHE_TTL_MS = 60 * 60 * 1000;

async function getAllStaff() {

    if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.data;
    }

    let page = 1;

    allStaff = [];

    while (true) {
        const res = await fetch(
            `https://contourcandidate.web.app/api/roster?page=${page}`,
            { headers: { "X-Api-Key": process.env.ROSTER_API_KEY } }
        );

        const data = await res.json();

        if (data.status != "ok") {
            throw new Error(data.message);
        }

        allStaff.push(...data.staff);
        if (!data.next_page) break;

        cache = { data: allStaff, fetchedAt: Date.now() };
        return allStaff;
    }
}

async function getStaffByEmail(email) {
    const staff = await getAllStaff();
    return staff.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

module.exports = { getAllStaff, getStaffByEmail };