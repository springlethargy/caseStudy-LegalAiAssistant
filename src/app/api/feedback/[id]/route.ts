import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = parseInt(params.id, 10);

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
		}

		const dataSource = await getDataSource();
		const feedbackRepository = dataSource.getRepository(Feedback);

		const feedback = await feedbackRepository.findOneBy({ id });

		if (!feedback) {
			return NextResponse.json(
				{ error: "Feedback not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(feedback);
	} catch (error) {
		console.error("Error retrieving feedback:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve feedback" },
			{ status: 500 },
		);
	}
}
