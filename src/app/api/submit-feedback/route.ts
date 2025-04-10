import { NextRequest, NextResponse } from "next/server";

interface FeedbackRequest {
	query: string;
	response: string;
	rate: number;
	id: string;
}

export async function POST(request: NextRequest) {
	try {
		const { query, response, rate, id } =
			(await request.json()) as FeedbackRequest;

		// 验证必要字段
		if (!query || !response || rate === undefined || !id) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// 验证rate值
		if (typeof rate !== "number" || rate < 0 || rate > 10) {
			return NextResponse.json(
				{ error: "Rate must be a number between 0 and 10" },
				{ status: 400 },
			);
		}

		// 向外部API提交反馈
		const feedbackUrl = `${process.env.DB_URL}/feedback`;
		const externalResponse = await fetch(feedbackUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				response,
				rate,
				id,
			}),
		});

		if (!externalResponse.ok) {
			const errorData = await externalResponse.json().catch(() => ({}));
			console.error("External API error:", errorData);
			return NextResponse.json(
				{ error: "Failed to submit feedback to external API" },
				{ status: externalResponse.status },
			);
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error processing feedback:", error);
		return NextResponse.json(
			{ error: "Failed to process feedback" },
			{ status: 500 },
		);
	}
}
