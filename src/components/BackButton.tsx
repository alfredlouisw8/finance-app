"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function BackButton() {
	const router = useRouter();

	return (
		<Button variant="ghost" className="mb-5" onClick={() => router.back()}>
			Back
		</Button>
	);
}
