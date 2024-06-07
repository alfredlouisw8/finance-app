import BackButton from "@/components/BackButton";
import { RiskProfileSurveyForm } from "./_components/RiskProfileSurveyForm";

export default function Page({ params }: { params: { id: string } }) {
	return (
		<>
			<BackButton />
			<RiskProfileSurveyForm id={params.id} />
		</>
	);
}
