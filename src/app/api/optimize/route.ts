export async function POST(request: Request) {
	const res = await request.json();

	const { yearAgo, userId } = res;

	return Response.json({ res });
}
