import LoginForm from "@/components/LoginForm";
import { Role } from "@/types/User";

export default function SignIn() {
	return (
		<div className="flex items-center gap-10">
			<LoginForm role={Role.ADVISOR} />
			<LoginForm role={Role.CLIENT} />
		</div>
	);
}
