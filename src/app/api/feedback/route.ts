import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";

export interface FeedbackRequest {
	query: string;
	response: string;
	rate: number;
}

export async function GET(request: NextRequest) {
	try {
		const dataSource = await getDataSource();
		const feedbackRepository = dataSource.getRepository(Feedback);

		// Get URL parameters
		const searchParams = request.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit") || "50", 10);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const skip = (page - 1) * limit;

		// Query feedback with pagination
		const [feedbacks, total] = await feedbackRepository.findAndCount({
			order: { time: "DESC" },
			take: limit,
			skip: skip,
		});

		return NextResponse.json({
			data: feedbacks,
			meta: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error retrieving feedback:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve feedback" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { query, response, rate } = (await request.json()) as FeedbackRequest;

		// Validate required fields
		if (!query || !response || rate === undefined) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Validate rate value
		if (typeof rate !== "number" || rate < 0 || rate > 10) {
			return NextResponse.json(
				{ error: "Rate must be a number between 0 and 10" },
				{ status: 400 },
			);
		}

		// Get database connection
		const dataSource = await getDataSource();
		const feedbackRepository = dataSource.getRepository(Feedback);

		// Create new feedback
		const feedback = new Feedback();
		feedback.query = query;
		feedback.response = response;
		feedback.rate = rate;

		// Save to database
		const result = await feedbackRepository.save(feedback);

		return NextResponse.json({ success: true, id: result.id }, { status: 201 });
	} catch (error) {
		console.error("Error saving feedback:", error);
		return NextResponse.json(
			{ error: "Failed to process feedback" },
			{ status: 500 },
		);
	}
}
