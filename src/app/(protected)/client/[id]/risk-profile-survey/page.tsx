import { RiskProfileSurveyForm } from "./_components/RiskProfileSurveyForm";

export default function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<RiskProfileSurveyForm id={params.id} />
		</>
	);
}
