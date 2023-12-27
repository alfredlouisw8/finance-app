import { RiskProfile } from "@/types/User";

export const getRiskProfileResult = (totalPoint: number): RiskProfile => {
	if (totalPoint >= 64) {
		return RiskProfile.RISK_SEEKING;
	} else if (totalPoint >= 48) {
		return RiskProfile.SLIGHTLY_RISK_SEEKING;
	} else if (totalPoint >= 32) {
		return RiskProfile.SLIGHTLY_RISK_AVERSE;
	} else {
		return RiskProfile.RISK_AVERSE;
	}
};
