import { RiskProfileSurveyForm } from "@/app/(protected)/client/[id]/risk-profile-survey/_components/RiskProfileSurveyForm";

export default function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<RiskProfileSurveyForm id={params.id} />
		</>
	);
}
