export type User = {
	id: string;
	name: string;
	email: string;
	role: Role;
	riskProfile?: RiskProfile;
	phone?: string;
	createdAt: string;
};

export enum Role {
	USER = "USER",
	ADVISOR = "ADVISOR",
}

export enum RiskProfile {
	RISK_SEEKING = "Risk-seeking",
	SLIGHTLY_RISK_SEEKING = "Slightly risk-seeking",
	RISK_AVERSE = "Risk-averse",
	SLIGHTLY_RISK_AVERSE = "Slightly risk-averse",
}
