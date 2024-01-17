export type User = {
	id: string;
	name: string;
	email: string;
	riskProfile?: RiskProfile;
	createdAt: string;
	equityAllocation?: number;
	advisorId: string;
};

export enum RiskProfile {
	RISK_SEEKING = "Risk-seeking",
	SLIGHTLY_RISK_SEEKING = "Slightly risk-seeking",
	RISK_AVERSE = "Risk-averse",
	SLIGHTLY_RISK_AVERSE = "Slightly risk-averse",
}

export enum Role {
	ADVISOR = "advisor",
	CLIENT = "client",
}
